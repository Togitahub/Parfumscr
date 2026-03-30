import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand",
			required: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		segment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Segment",
			required: true,
		},
		isDecant: { type: Boolean, default: false },
		linkedProduct: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			default: null,
		},
		discount: { type: Number, default: 0 },
		notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
		price: { type: Number, required: true },
		stock: { type: Number, default: 0 },
		images: [{ type: String, required: true }],
		description: { type: String },
		size: { type: String },
	},
	{ timestamps: true },
);
export default mongoose.model("Product", ProductSchema, "products");
