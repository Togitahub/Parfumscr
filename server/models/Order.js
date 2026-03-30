import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		orderItems: [
			{
				name: { type: String, required: true },
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
			},
		],
		totalPrice: { type: Number, required: true },
		status: { type: String, default: "SOLICITADO_WS" }, // Para control interno 📱
	},
	{ timestamps: true },
);
export default mongoose.model("Order", OrderSchema, "orders");
