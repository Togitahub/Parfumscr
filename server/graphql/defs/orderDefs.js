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
		store: ID
		orderItems: [OrderItem]!
		totalPrice: Float!
		status: String
		createdAt: String
	}

	type Query {
		getMyOrders(userId: ID!): [Order]
		getOrderById(id: ID!): Order
		getAllOrders: [Order]
	}

	type Mutation {
		createOrder(
			userId: ID
			storeId: ID
			totalPrice: Float!
			items: [String]!
		): Order
		updateOrderStatus(id: ID!, status: String!): Order
	}
`;

export default orderDefs;
