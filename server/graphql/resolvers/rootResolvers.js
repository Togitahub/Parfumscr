import { mergeResolvers } from "@graphql-tools/merge";

import userResolvers from "./userResolvers.js";
import brandResolvers from "./brandResolvers.js";
import productResolvers from "./productResolvers.js";
import categoryResolvers from "./categoryResolvers.js";
import segmentResolvers from "./segmentResolvers.js";
import orderResolvers from "./orderResolvers.js";
import favoritesResolvers from "./favoritesResolvers.js";
import cartResolvers from "./cartResolvers.js";
import noteResolvers from "./noteResolvers.js";
import storeResolvers from "./storeResolvers.js";

export const resolvers = mergeResolvers([
	userResolvers,
	brandResolvers,
	productResolvers,
	categoryResolvers,
	segmentResolvers,
	orderResolvers,
	favoritesResolvers,
	noteResolvers,
	cartResolvers,
	storeResolvers,
]);
