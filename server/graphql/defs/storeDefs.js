import gql from "graphql-tag";

const storeDefs = gql`
	type Store {
		id: ID!
		slug: String!
		customDomain: String
		storeName: String!
		owner: ID!
		colorMain: String!
		colorFirst: String!
		colorSecond: String!
		logo: String
		whatsapp: String
		facebook: String
		instagram: String
		active: Boolean!
		heroTagline: String
		heroDescription: String
		heroBadge1: String
		heroBadge2: String
		createdAt: String
	}

	type StoreProduct {
		id: ID!
		store: ID!
		product: Product!
		price: Float
		stock: Int
		discount: Float
		active: Boolean!
		views: Int
	}

	type ProductStat {
		product: Product!
		count: Int!
	}

	type DashboardStats {
		totalRequests: Int!
		confirmedSales: Int!
		closingRate: Float!
		confirmedRevenue: Float!
		topRequested: [ProductStat!]!
		topViewed: [ProductStat!]!
		topFavorited: [ProductStat!]!
	}

	type Query {
		getMyStore: Store
		getStoreProducts(storeId: ID!): [StoreProduct]
		getStores: [Store]
		getDashboardStats(storeId: ID!, period: String): DashboardStats
	}

	type Mutation {
		createStore(
			slug: String!
			storeName: String!
			whatsapp: String
			facebook: String
			instagram: String
			logo: String
			colorMain: String
			colorFirst: String
			colorSecond: String
			heroTagline: String
			heroDescription: String
			heroBadge1: String
			heroBadge2: String
		): Store!

		updateStore(
			storeName: String
			customDomain: String
			whatsapp: String
			facebook: String
			instagram: String
			logo: String
			colorMain: String
			colorFirst: String
			colorSecond: String
			heroTagline: String
			heroDescription: String
			heroBadge1: String
			heroBadge2: String
		): Store!

		addProductToStore(
			productId: ID!
			price: Float
			stock: Int
			discount: Float
		): StoreProduct!
		updateStoreProduct(
			productId: ID!
			price: Float
			stock: Int
			discount: Float
		): StoreProduct!
		registerProductView(productId: ID!): Boolean
		removeProductFromStore(productId: ID!): DeleteResponse!
		toggleStoreProduct(productId: ID!, active: Boolean!): StoreProduct!
	}
`;

export default storeDefs;
