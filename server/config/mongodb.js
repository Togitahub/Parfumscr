import mongoose from "mongoose";
import createAdmin from "./createAdmin.js";

const mongodbConnection = async () => {
	try {
		const db = await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB:", db.connection.name);
		await createAdmin();
		return db;
	} catch (error) {
		console.error("Error connecting to MongoDB:", error.message);
		throw error;
	}
};

export default mongodbConnection;
