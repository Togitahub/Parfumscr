import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		store: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Store",
			default: null,
		},
		orderItems: [
			{
				name: { type: String, required: true },
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
			},
		],
		totalPrice: { type: Number, required: true },
		status: { type: String, default: "SOLICITADO_WS" },
		confirmedAt: { type: Date, default: null },
		finalPrice: { type: Number, default: null },
	},
	{ timestamps: true },
);
export default mongoose.model("Order", OrderSchema, "orders");
