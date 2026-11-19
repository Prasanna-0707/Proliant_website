// =====================================================
// ONE-TIME MIGRATION: candidates -> hrcandidates
//
// Copies existing HR-style application records from the
// `candidates` collection (model Candidate) into the
// `hrcandidates` collection (model HRCandidate).
//
// SAFETY
//   * DRY RUN by default. Nothing is written unless --execute is passed.
//   * The source `candidates` collection is only ever READ.
//   * Never updates or deletes any existing document.
//   * Idempotent: each copied document keeps its original _id, so a
//     document that already exists in hrcandidates is skipped. Running
//     it again never creates duplicates.
//   * No job references are invented: fields that do not exist in the
//     HRCandidate schema (job, department, currentStage, assignedScreener,
//     joinedAt) are NOT copied and are reported.
//   * Original createdAt / updatedAt / __v are preserved.
//
// USAGE (from the backend folder)
//   node scripts/migrateCandidatesToHrCandidates.js              # dry run
//   node scripts/migrateCandidatesToHrCandidates.js --execute    # copy
// =====================================================

import "dotenv/config";
import mongoose from "mongoose";

import HRCandidate from "../src/modules/hr/models/HRCandidate.js";

const SOURCE_COLLECTION = "candidates";
const TARGET_COLLECTION = HRCandidate.collection.collectionName; // hrcandidates

const execute = process.argv.includes("--execute");

const HR_FIELDS = new Set(Object.keys(HRCandidate.schema.paths));
const IGNORED_SYSTEM_FIELDS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

const countBy = (items, keyFn) =>
  items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db;
  const source = db.collection(SOURCE_COLLECTION);
  const target = db.collection(TARGET_COLLECTION);

  console.log("====================================================");
  console.log(execute ? "MODE: EXECUTE (writes to hrcandidates)" : "MODE: DRY RUN (no writes)");
  console.log(`Database : ${mongoose.connection.name}`);
  console.log(`Source   : ${SOURCE_COLLECTION} (read-only)`);
  console.log(`Target   : ${TARGET_COLLECTION}`);
  console.log("====================================================");

  const sourceDocs = await source.find({}).toArray();
  const existingIds = new Set(
    (await target.find({}, { projection: { _id: 1 } }).toArray()).map((d) => String(d._id))
  );

  const toInsert = [];
  const alreadyMigrated = [];
  const invalid = [];
  const droppedFieldCounts = {};

  for (const original of sourceDocs) {
    if (existingIds.has(String(original._id))) {
      alreadyMigrated.push(original._id);
      continue;
    }

    // Keep only fields that exist in the HRCandidate schema.
    const copy = {};

    for (const [key, value] of Object.entries(original)) {
      if (IGNORED_SYSTEM_FIELDS.has(key)) continue;

      if (HR_FIELDS.has(key)) {
        copy[key] = value;
      } else {
        droppedFieldCounts[key] = (droppedFieldCounts[key] || 0) + 1;
      }
    }

    // Validate against the real HRCandidate schema (required fields, enums).
    const probe = new HRCandidate(copy);
    let validationError = null;

    try {
      await probe.validate();
    } catch (error) {
      validationError = error;
    }

    if (validationError) {
      invalid.push({
        _id: String(original._id),
        email: original.email,
        problems: Object.values(validationError.errors).map((e) => `${e.path}: ${e.message}`),
      });
      continue;
    }

    toInsert.push({
      ...probe.toObject({ depopulate: true }),
      _id: original._id,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      __v: original.__v ?? 0,
    });
  }

  // ---------------- report ----------------
  console.log(`\nSource documents            : ${sourceDocs.length}`);
  console.log(`Already in ${TARGET_COLLECTION} (skipped): ${alreadyMigrated.length}`);
  console.log(`Can be migrated             : ${toInsert.length}`);
  console.log(`Schema mismatches (blocked) : ${invalid.length}`);

  console.log("\nStatus of records that can be migrated:");
  console.log(countBy(toInsert, (d) => d.status || "(none)"));

  console.log("\nFields present in source but NOT in the HRCandidate schema (not copied):");
  console.log(Object.keys(droppedFieldCounts).length ? droppedFieldCounts : "none");

  if (invalid.length) {
    console.log("\nRecords that cannot be migrated:");
    for (const item of invalid) {
      console.log(` - ${item._id} (${item.email}): ${item.problems.join("; ")}`);
    }
  }

  if (!execute) {
    console.log("\nDRY RUN complete. Nothing was written.");
    console.log("Re-run with --execute only after the plan has been approved.");
    return;
  }

  if (toInsert.length === 0) {
    console.log("\nNothing to copy.");
    return;
  }

  const result = await target.insertMany(toInsert, { ordered: false });

  console.log(`\nCopied ${result.insertedCount} document(s) into ${TARGET_COLLECTION}.`);
  console.log(`Source collection ${SOURCE_COLLECTION} was not modified.`);
};

run()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
