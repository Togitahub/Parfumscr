import Brand from "../../models/Brand.js";
import Product from "../../models/Product.js";

const brandResolvers = {
	Query: {
		getBrand: async (_, { id }) => await Brand.findById(id),
		getBrands: async () => await Brand.find(),
	},

	Brand: {
		products: async (parent) =>
			await Product.find({ brand: parent.id }).populate(
				"brand category segment",
			),
	},

	Mutation: {
		createBrand: async (_, { name }, context) => {
			if (!context.user || !["ADMIN", "SUPERADMIN"].includes(context.user.role))
				throw new Error("Not authorized");
			return await Brand.create({ name });
		},

		updateBrand: async (_, { id, name }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			return await Brand.findByIdAndUpdate(id, { name }, { new: true });
		},

		deleteBrand: async (_, { id }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			await Product.updateMany(
				{ brand: id },
				{ $unset: { brand: "No brand" } },
			);
			await Brand.findByIdAndDelete(id);
			return { success: true, message: "Brand deleted" };
		},
	},
};

export default brandResolvers;
