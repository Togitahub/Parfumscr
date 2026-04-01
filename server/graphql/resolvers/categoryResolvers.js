import Category from "../../models/Category.js";
import Product from "../../models/Product.js";

const categoryResolvers = {
	Query: {
		getCategory: async (_, { id }) => await Category.findById(id),
		getCategories: async () => await Category.find(),
	},

	Category: {
		products: async (parent) =>
			await Product.find({ category: parent.id }).populate(
				"brand category segment",
			),
	},

	Mutation: {
		createCategory: async (_, { name }, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			) {
				console.log(context.user.role);
				throw new Error("Not authorized");
			}

			return await Category.create({ name });
		},

		updateCategory: async (_, { id, name }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			return await Category.findByIdAndUpdate(id, { name }, { new: true });
		},

		deleteCategory: async (_, { id }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			await Product.updateMany(
				{ category: id },
				{ $unset: { category: "No category" } },
			);
			await Category.findByIdAndDelete(id);
			return { success: true, message: "Category deleted" };
		},
	},
};

export default categoryResolvers;
