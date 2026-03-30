import mongoose from "mongoose";

const StoreProductSchema = new mongoose.Schema(
	{
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		price: {
			type: Number,
			default: null,
		},
		stock: {
			type: Number,
			default: null,
		},
		active: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

StoreProductSchema.index({ store: 1, product: 1 }, { unique: true });

export default mongoose.model(
	"StoreProduct",
	StoreProductSchema,
	"store_products",
);
