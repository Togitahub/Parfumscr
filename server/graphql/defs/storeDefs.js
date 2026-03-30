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
		active: Boolean!
	}

	type Query {
		getMyStore: Store
		getStoreProducts(storeId: ID!): [StoreProduct]
		getStores: [Store]
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

		addProductToStore(productId: ID!, price: Float, stock: Int): StoreProduct!
		updateStoreProduct(productId: ID!, price: Float, stock: Int): StoreProduct!
		removeProductFromStore(productId: ID!): DeleteResponse!
		toggleStoreProduct(productId: ID!, active: Boolean!): StoreProduct!
	}
`;

export default storeDefs;
