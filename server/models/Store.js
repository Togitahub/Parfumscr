import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		customDomain: {
			type: String,
			default: null,
		},
		storeName: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		colorMain: {
			type: String,
			default: "black",
		},
		colorFirst: {
			type: String,
			default: "white",
		},
		colorSecond: {
			type: String,
			default: "cyan",
		},
		logo: {
			type: String,
			default: null,
		},
		whatsapp: {
			type: String,
			default: null,
		},
		facebook: {
			type: String,
			default: null,
		},
		instagram: {
			type: String,
			default: null,
		},
		active: {
			type: Boolean,
			default: true,
		},
		heroTagline: {
			type: String,
			default: null,
		},
		heroDescription: {
			type: String,
			default: null,
		},
		heroBadge1: {
			type: String,
			default: null,
		},
		heroBadge2: {
			type: String,
			default: null,
		},
	},
	{ timestamps: true },
);

export default mongoose.model("Store", StoreSchema, "stores");
