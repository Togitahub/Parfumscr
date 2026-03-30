import Note from "../../models/Note.js";
import Product from "../../models/Product.js";

const noteResolvers = {
	Query: {
		getNote: async (_, { id }) => await Note.findById(id),
		getNotes: async () => await Note.find(),
	},
	Note: {
		products: async (parent) =>
			await Product.find({ notes: parent._id }).populate(
				"brand category segment notes",
			),
	},
	Mutation: {
		createNote: async (_, { name }, context) => {
			if (
				!context.user ||
				!["ADMIN", "SUPER_ADMIN"].includes(context.user.role)
			)
				throw new Error("Not authorized");
			return await Note.create({ name });
		},
		updateNote: async (_, { id, name }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			return await Note.findByIdAndUpdate(id, { name }, { new: true });
		},
		deleteNote: async (_, { id }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			await Product.updateMany({ notes: id }, { $pull: { notes: id } });
			await Note.findByIdAndDelete(id);
			return { success: true, message: "Note deleted" };
		},
	},
};
export default noteResolvers;
