import gql from "graphql-tag";

const orderDefs = gql`
	type OrderItem {
		name: String!
		quantity: Int!
		price: Float!
	}

	type Order {
		id: ID!
		user: ID
		orderItems: [OrderItem]!
		totalPrice: Float!
		status: String
		createdAt: String
	}

	type Query {
		getMyOrders(userId: ID!): [Order]
		getOrderById(id: ID!): Order
	}

	type Mutation {
		createOrder(userId: ID, totalPrice: Float!, items: [String]!): Order
	}
`;

export default orderDefs;
