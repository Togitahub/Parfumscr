import gql from "graphql-tag";

const cartDefs = gql`
	type CartItem {
		product: Product!
		quantity: Int!
	}

	type Cart {
		id: ID!
		user: ID!
		items: [CartItem]
	}

	type Query {
		getUserCart(userId: ID!): Cart
	}

	type Mutation {
		addItemToCart(userId: ID!, productId: ID!, quantity: Int!): Cart
		removeItemFromCart(userId: ID!, productId: ID!): DeleteResponse
		clearCart(userId: ID!): DeleteResponse
	}
`;

export default cartDefs;
