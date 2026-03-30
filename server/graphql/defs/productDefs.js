import gql from "graphql-tag";

const productDefs = gql`
	type Product {
		id: ID!
		name: String!
		brand: Brand!
		category: Category!
		segment: Segment!
		price: Float!
		stock: Int
		images: [String]!
		description: String
		size: String
		notes: [Note!]!
		isDecant: Boolean!
		linkedProduct: Product
		decants: [Product]
		createdAt: String
	}

	# Input para crear decants al mismo tiempo que el perfume padre
	input DecantInput {
		size: String!
		price: Float!
		stock: Int
	}

	type Query {
		getProducts(isDecant: Boolean): [Product]
		getProduct(id: ID!): Product
	}

	type Mutation {
		createProduct(
			name: String!
			brand: String!
			category: ID!
			segment: ID!
			price: Float!
			stock: Int
			images: [String]!
			description: String
			size: String
			notes: [ID]
			isDecant: Boolean
			linkedProduct: ID
			decants: [DecantInput]
		): Product

		updateProduct(
			id: ID!
			name: String
			brand: String
			category: ID
			segment: ID
			price: Float
			stock: Int
			images: [String]
			description: String
			size: String
			notes: [ID]
			isDecant: Boolean
			linkedProduct: ID
			decants: [DecantInput]
		): Product

		deleteProduct(id: ID!): DeleteResponse
	}
`;

export default productDefs;
