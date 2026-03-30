import { mergeTypeDefs } from "@graphql-tools/merge";

import gql from "graphql-tag";
import userDefs from "./userDefs.js";
import brandDefs from "./brandDefs.js";
import productDefs from "./productDefs.js";
import categoryDefs from "./categoryDefs.js";
import segmentDefs from "./segmentDefs.js";
import orderDefs from "./orderDefs.js";
import favoritesDefs from "./favoritesDefs.js";
import cartDefs from "./cartDefs.js";
import noteDefs from "./noteDefs.js";
import storeDefs from "./storeDefs.js";

const rootDefs = gql`
	type Query {
		_empty: String
	}

	type Mutation {
		_empty: String
	}

	type DeleteResponse {
		success: Boolean!
		message: String!
	}
`;

export const typeDefs = mergeTypeDefs([
	rootDefs,
	userDefs,
	brandDefs,
	productDefs,
	categoryDefs,
	segmentDefs,
	orderDefs,
	favoritesDefs,
	noteDefs,
	cartDefs,
	storeDefs,
]);
