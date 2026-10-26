import Counter from "../../models/Counter.js";

const generateCandidateId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "candidateId",
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );

  const year = new Date().getFullYear();

  const sequence = String(counter.seq).padStart(6, "0");

  return `PD-CAN-${year}-${sequence}`;
};

export default generateCandidateId;