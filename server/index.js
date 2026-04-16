import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./models/User.js";
import Store from "./models/Store.js";
import cookieParser from "cookie-parser";
import cloudinary from "./config/cloudinary.js";
import mongodbConnection from "./config/mongodb.js";
import createApolloServer from "./config/apolloServer.js";

import { expressMiddleware } from "@as-integrations/express5";
import { deleteImage, extractPublicId } from "./config/cloudinary.js";
import { clearRefreshTokenCookieOptions } from "./config/cookieConfig.js";

const app = express();
const httpServer = http.createServer(app);
const serverPort = process.env.SERVER_PORT || 4000;

if (!process.env.MONGO_URI) {
	console.error("DB Uri is not defined");
	process.exit(1);
}

const whitelist = [
	"http://localhost:5173",
	"https://parfumsoft.com",
	"https://www.parfumsoft.com",
	"https://parfumscr-mauve.vercel.app",
];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);

		const isMainDomain = whitelist.includes(origin);

		const isOwnSubdomain = origin.endsWith(".parfumsoft.com");

		if (isMainDomain || isOwnSubdomain) {
			callback(null, true);
		} else {
			callback(new Error("Dominio no autorizado por CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const ALLOWED_TYPES = [
	"image/webp",
	"image/png",
	"image/jpg",
	"image/jpeg",
	"image/avif",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

app.post("/api/cloudinary-signature", async (req, res) => {
	try {
		const { fileType, fileSize } = req.body;

		if (!ALLOWED_TYPES.includes(fileType)) {
			return res.status(400).json({
				error: "Tipo de archivo no permitido. Solo WebP, PNG, JPG o AVIF",
			});
		}

		if (fileSize > MAX_SIZE_BYTES) {
			return res.status(400).json({
				error: "El archivo supera el límite de 5MB",
			});
		}

		const timestamp = Math.round(new Date().getTime() / 1000);

		const paramsToSign = {
			timestamp,
			folder: "products",
			eager: "w_1200,q_auto:best,f_auto|w_400,q_auto:good,f_auto",
			eager_async: true,
		};

		const signature = cloudinary.utils.api_sign_request(
			paramsToSign,
			process.env.CLOUD_SECRET,
		);

		res.json({
			signature,
			timestamp,
			cloudName: process.env.CLOUD_NAME,
			apiKey: process.env.CLOUD_KEY,
			folder: paramsToSign.folder,
			eager: paramsToSign.eager,
			eager_async: true,
		});
	} catch (error) {
		console.error("Error generating signature:", error);
		res.status(500).json({ error: "Failed to generate signature" });
	}
});

app.post("/api/cloudinary-delete", async (req, res) => {
	try {
		const { url } = req.body;
		const publicId = extractPublicId(url);
		if (!publicId) return res.status(400).json({ error: "Invalid URL" });
		await deleteImage(publicId);
		res.json({ success: true });
	} catch (error) {
		console.error("Error deleting image:", error);
		res.status(500).json({ error: "Failed to delete image" });
	}
});

app.get("/api/store-config", async (req, res) => {
	try {
		const slug = req.query.slug;
		const host = req.headers.host?.split(":")[0];

		let store = null;

		// Buscar primero por customDomain
		if (host) {
			store = await Store.findOne({ customDomain: host, active: true });
		}

		// Si no, buscar por slug (query param o subdominio)
		if (!store && slug) {
			store = await Store.findOne({ slug, active: true });
		}

		// Intentar extraer slug del subdominio
		if (!store && host) {
			const subdomain = host.split(".")[0];
			if (subdomain && subdomain !== "www") {
				store = await Store.findOne({ slug: subdomain, active: true });
			}
		}

		if (!store) return res.status(404).json({ error: "Store not found" });

		res.json({
			storeId: store._id,
			storeName: store.storeName,
			slug: store.slug,
			colorMain: store.colorMain,
			colorFirst: store.colorFirst,
			colorSecond: store.colorSecond,
			logo: store.logo,
			posEnabled: store.posEnabled ?? false,
			whatsapp: store.whatsapp,
			facebook: store.facebook,
			instagram: store.instagram,
			heroTagline: store.heroTagline,
			heroDescription: store.heroDescription,
			heroBadge1: store.heroBadge1,
			heroBadge2: store.heroBadge2,
		});
	} catch (error) {
		console.error("Error fetching store config:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.post("/api/refresh-token", async (req, res) => {
	const token = req.cookies?.refreshToken;

	if (!token) return res.status(401).json({ error: "No refresh token" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		const user = await User.findById(decoded.id);
		if (!user || !user.active) {
			res.clearCookie("refreshToken");
			return res.status(401).json({ error: "Unauthorized" });
		}

		const accessToken = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "60s" },
		);

		res.json({ token: accessToken });
	} catch {
		res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
		res.status(401).json({ error: "Invalid refresh token" });
	}
});

(async () => {
	try {
		await mongodbConnection();
		const server = await createApolloServer();

		app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async ({ req, res }) => {
					const token = req.headers.authorization || "";

					if (token) {
						try {
							const decodedToken = jwt.verify(
								token.replace("Bearer ", ""),
								process.env.JWT_SECRET,
							);
							const user = await User.findById(decodedToken.id);
							if (!user) throw new Error("User not found");
							return { user, res };
						} catch (error) {
							console.error("Authentication error:", error.message);
							return { user: null, res };
						}
					}
					return { user: null, res };
				},
			}),
		);

		app.get("/health", (req, res) => {
			res.status(200).json({ status: "OK", message: "Server is running" });
		});

		await new Promise((resolve) => {
			httpServer.listen({ port: serverPort }, resolve);
		});

		console.log(`Server running on port: ${serverPort}`);
	} catch (error) {
		console.error("Error starting server:", error.message);
		process.exit(1);
	}
})();

process.on("SIGINT", async () => {
	console.log("Shutting down gracefully...");
	await mongoose.connection.close();
	process.exit(0);
});
