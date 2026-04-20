import Store from "../../models/Store.js";
import Order from "../../models/Order.js";
import StoreProduct from "../../models/StoreProduct.js";

import { deleteImage, extractPublicId } from "../../config/cloudinary.js";
import { getDateFilter } from "./expenseResolvers.js";

import { AuthError } from "./userResolvers.js";

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
			if (!user) throw new AuthError();
			if (!["ADMIN", "SUPER_ADMIN"].includes(user.role))
				throw new Error("Unauthorized");
			return await Store.findOne({ owner: user._id });
		},

		getStoreProducts: async (_, { storeId }) => {
			const store = await Store.findById(storeId);
			if (!store || !store.active) return [];

			return await StoreProduct.find({
				store: storeId,
				active: true,
			}).populate(PRODUCT_POPULATE);
		},

		getStores: async () => {
			return await Store.find({ active: true });
		},

		getDashboardStats: async (
			_,
			{ storeId, period, startDate, endDate },
			{ user },
		) => {
			if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role))
				throw new Error("Unauthorized");

			const dateFilter = getDateFilter(period, startDate, endDate);
			const orderFilter = { store: storeId };
			if (dateFilter) orderFilter.createdAt = dateFilter;

			const orders = await Order.find(orderFilter);

			const totalRequests = orders.length;
			const completed = orders.filter((o) => o.status === "COMPLETADO");
			const confirmedSales = completed.length;
			const closingRate =
				totalRequests > 0 ? (confirmedSales / totalRequests) * 100 : 0;
			const confirmedRevenue = completed.reduce(
				(acc, o) => acc + (o.finalPrice ?? o.totalPrice),
				0,
			);

			const completedOrders = orders.filter((o) => o.status === "COMPLETADO");
			const soldCount = {};
			for (const order of completedOrders) {
				for (const item of order.orderItems) {
					const key = item.productId?.toString();
					if (key) soldCount[key] = (soldCount[key] || 0) + item.quantity;
				}
			}

			const storeProducts = await StoreProduct.find({
				store: storeId,
				active: true,
			}).populate(PRODUCT_POPULATE);

			const topViewed = storeProducts
				.sort((a, b) => (b.views || 0) - (a.views || 0))
				.slice(0, 5)
				.map((sp) => ({ product: sp.product, count: sp.views || 0 }));

			const topRequestedRaw = Object.entries(soldCount)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5);

			const topRequested = topRequestedRaw
				.map(([productId, count]) => {
					const sp = storeProducts.find(
						(sp) => sp.product?._id?.toString() === productId,
					);
					if (!sp) return null;
					return { product: sp.product, count };
				})
				.filter(Boolean);

			const Favorites = (await import("../../models/Favorites.js")).default;
			const allFavs = await Favorites.find();
			const favCount = {};
			for (const fav of allFavs) {
				for (const productId of fav.products) {
					const id = productId.toString();
					favCount[id] = (favCount[id] || 0) + 1;
				}
			}

			const topFavorited = storeProducts
				.map((sp) => ({
					product: sp.product,
					count: favCount[sp.product?._id?.toString()] || 0,
				}))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5)
				.filter((x) => x.count > 0);

			return {
				totalRequests,
				confirmedSales,
				closingRate: parseFloat(closingRate.toFixed(1)),
				confirmedRevenue,
				topRequested,
				topViewed,
				topFavorited,
			};
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

		addProductToStore: async (
			_,
			{ productId, price, stock, discount },
			{ user },
		) => {
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

			if (discount !== undefined && existing) existing.discount = discount;

			const storeProduct = await StoreProduct.create({
				store: store._id,
				product: productId,
				active: true,
				price: price ?? null,
				stock: stock ?? null,
				discount: discount ?? null,
			});

			return await storeProduct.populate(PRODUCT_POPULATE);
		},

		updateStoreProduct: async (
			_,
			{ productId, price, stock, discount },
			{ user },
		) => {
			if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

			const store = await Store.findOne({ owner: user._id });
			if (!store) throw new Error("Store not found");

			const storeProduct = await StoreProduct.findOneAndUpdate(
				{ store: store._id, product: productId },
				{ price, stock, discount },
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

		toggleStorePos: async (_, { ownerId }, { user }) => {
			if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
			const store = await Store.findOne({ owner: ownerId });
			if (!store) throw new Error("Store not found");
			return await Store.findByIdAndUpdate(
				store._id,
				{ posEnabled: !store.posEnabled },
				{ new: true },
			);
		},

		toggleHomeShow: async (_, { ownerId }, { user }) => {
			if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");
			const store = await Store.findOne({ owner: ownerId });
			if (!store) throw new Error("Store not found");
			return await Store.findByIdAndUpdate(
				store._id,
				{ homeShow: !store.homeShow },
				{ new: true },
			);
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

		registerProductView: async (_, { productId }) => {
			await StoreProduct.findOneAndUpdate(
				{ product: productId },
				{ $inc: { views: 1 } },
			);
			return true;
		},
	},
};

export default storeResolvers;
