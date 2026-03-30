import mongoose from "mongoose";

const SegmentSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
	},
	{ timestamps: true },
);
export default mongoose.model("Segment", SegmentSchema, "segments");
