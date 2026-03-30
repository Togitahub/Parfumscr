import User from "../models/User.js";

const createAdmin = async () => {
	try {
		const userCount = await User.countDocuments();

		if (userCount > 0) {
			console.log("Admin already exists, skipping admin creation");
			return;
		}

		await User.create({
			name: process.env.SUPER_ADMIN_NAME,
			email: process.env.SUPER_ADMIN_EMAIL,
			password: process.env.SUPER_ADMIN_PASSWORD,
			role: "SUPER_ADMIN",
		});

		console.log("Admin successfully created");
	} catch (error) {
		console.error("Error creating admin:", error.message);
	}
};

export default createAdmin;
