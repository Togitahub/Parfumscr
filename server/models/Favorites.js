import mongoose from "mongoose";

const FavoritesSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
	},
	{ timestamps: true },
);
export default mongoose.model("Favorites", FavoritesSchema, "favorites");
