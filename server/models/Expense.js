import mongoose from "mongoose";

const CATEGORIES = ["Inventario", "Envíos", "Marketing", "Operativo", "Otro"];

const ExpenseSchema = new mongoose.Schema(
	{
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			enum: CATEGORIES,
			default: "Otro",
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		date: {
			type: Date,
			default: Date.now,
		},
		notes: {
			type: String,
			default: null,
			trim: true,
		},
	},
	{ timestamps: true },
);

ExpenseSchema.index({ store: 1, date: -1 });

export default mongoose.model("Expense", ExpenseSchema, "expenses");
