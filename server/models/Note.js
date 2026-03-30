import mongoose from "mongoose";
const NoteSchema = new mongoose.Schema(
	{ name: { type: String, required: true, unique: true } },
	{ timestamps: true },
);
export default mongoose.model("Note", NoteSchema, "notes");
