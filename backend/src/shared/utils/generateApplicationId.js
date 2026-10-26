
import Counter from "../../models/Counter.js";

const generateApplicationId = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    {
      _id: `applicationId-${year}`,
    },
    {
      $inc: {
        seq: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  const sequenceNumber = String(counter.seq).padStart(6, "0");

  return `PD-APP-${year}-${sequenceNumber}`;
};

export default generateApplicationId;
