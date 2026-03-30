import Store from "../../models/Store.js";
import StoreProduct from "../../models/StoreProduct.js";

import { deleteImage, extractPublicId } from "../../config/cloudinary.js";

const PRODUCT_POPULATE = {
	path: "product",
	populate: [
		{ path: "brand" },
		{ path: "category" },
		{ path: "segment" },
		{ path: "notes" },
	],
};

const storeResolvers = {
	Query: {
		getMyStore: async (_, __, { user }) => {
			if (!user) throw new Error("Authentication required");
			if (!["ADMIN", "SUPER_ADMIN"].includes(user.role))
				throw new Error("Unauthorized");
			return await Store.findOne({ owner: user._id });
		},

		getStoreProducts: async (_, { storeId }) => {
			return await StoreProduct.find({
				store: storeId,
				active: true,
			}).populate(PRODUCT_POPULATE);
		},

		getStores: async () => {
			return await Store.find({ active: true });
		},
	},

	Mutation: {
		createStore: async (_, args, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const existing = await Store.findOne({ owner: user._id });
			if (existing) throw new Error("You already have a store");

			const slugTaken = await Store.findOne({ slug: args.slug });
			if (slugTaken) throw new Error("Slug already in use");

			return await Store.create({ ...args, owner: user._id });
		},

		updateStore: async (_, args, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			if (args.customDomain) {
				const domainTaken = await Store.findOne({
					customDomain: args.customDomain,
					_id: { $ne: store._id },
				});
				if (domainTaken) throw new Error("Domain already in use");
			}

			if (args.logo && store.logo && args.logo !== store.logo) {
				const publicId = extractPublicId(store.logo);
				if (publicId) await deleteImage(publicId);
			}

			return await Store.findByIdAndUpdate(store._id, args, { new: true });
		},

		addProductToStore: async (_, { productId, price, stock }, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			const existing = await StoreProduct.findOne({
				store: store._id,
				product: productId,
			});

			if (existing) {
				if (!existing.active) {
					existing.active = true;
					if (price !== undefined) existing.price = price;
					if (stock !== undefined) existing.stock = stock;
					await existing.save();
					return await existing.populate(PRODUCT_POPULATE);
				}
				throw new Error("Product already in store");
			}

			const storeProduct = await StoreProduct.create({
				store: store._id,
				product: productId,
				active: true,
				price: price ?? null,
				stock: stock ?? null,
			});

			return await storeProduct.populate(PRODUCT_POPULATE);
		},

		updateStoreProduct: async (_, { productId, price, stock }, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			const storeProduct = await StoreProduct.findOneAndUpdate(
				{ store: store._id, product: productId },
				{ price, stock },
				{ new: true },
			);

			if (!storeProduct) throw new Error("Product not found in store");

			return await storeProduct.populate(PRODUCT_POPULATE);
		},

		removeProductFromStore: async (_, { productId }, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			await StoreProduct.findOneAndDelete({
				store: store._id,
				product: productId,
			});

			return { success: true, message: "Product removed from store" };
		},

		toggleStoreProduct: async (_, { productId, active }, { user }) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			const storeProduct = await StoreProduct.findOneAndUpdate(
				{ store: store._id, product: productId },
				{ active },
				{ new: true },
			);

			if (!storeProduct) throw new Error("Product not found in store");

			return await storeProduct.populate(PRODUCT_POPULATE);
		},
	},
};

export default storeResolvers;
