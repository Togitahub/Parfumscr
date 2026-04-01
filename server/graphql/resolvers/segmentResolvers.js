import Segment from "../../models/Segment.js";
import Product from "../../models/Product.js";

const segmentResolvers = {
	Query: {
		getSegment: async (_, { id }) => await Segment.findById(id),
		getSegments: async () => await Segment.find(),
	},

	Segment: {
		products: async (parent) =>
			await Product.find({ segment: parent.id }).populate(
				"brand category segment",
			),
	},

	Mutation: {
		createSegment: async (_, { name }, context) => {
			if (!context.user || !["ADMIN", "SUPER_ADMIN"].includes(context.user.role))
				throw new Error("Not authorized");
			return await Segment.create({ name });
		},

		updateSegment: async (_, { id, name }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			return await Segment.findByIdAndUpdate(id, { name }, { new: true });
		},

		deleteSegment: async (_, { id }, context) => {
			if (!context.user || context.user.role !== "SUPER_ADMIN")
				throw new Error("Not authorized");
			await Product.updateMany(
				{ segment: id },
				{ $unset: { segment: "No segment" } },
			);
			await Segment.findByIdAndDelete(id);
			return { success: true, message: "Segment deleted" };
		},
	},
};

export default segmentResolvers;
