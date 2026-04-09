import gql from "graphql-tag";

const orderDefs = gql`
	type Installment {
		id: ID!
		number: Int!
		expectedAmount: Float!
		paidAmount: Float!
		remainingAmount: Float!
		status: String!
		paymentMethod: String
		note: String
	}

	type LayawayPayment {
		id: ID!
		amount: Float!
		paymentMethod: String
		note: String
		createdAt: String
		updatedAt: String
	}

	type OrderItem {
		productId: ID
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
		confirmedAt: String
		finalPrice: Float
		purchaseMode: String!
		paymentMethod: String
		amountPaid: Float!
		balanceDue: Float!
		stockDiscounted: Boolean!
		installmentCount: Int!
		installments: [Installment!]!
		layawayDays: Int
		layawayDeadline: String
		layawayPickedUp: Boolean!
		layawayPayments: [LayawayPayment!]!
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
		updateOrderStatus(id: ID!, status: String!, finalPrice: Float): Order
		configureOrderPurchase(
			id: ID!
			purchaseMode: String!
			installmentCount: Int
			layawayDays: Int
			initialPayment: Float
			paymentMethod: String
			note: String
		): Order
		updateInstallmentPayment(
			id: ID!
			installmentId: ID!
			paidAmount: Float!
			paymentMethod: String
			note: String
		): Order
		addLayawayPayment(
			id: ID!
			amount: Float!
			paymentMethod: String
			note: String
		): Order
		updateLayawayPayment(
			id: ID!
			paymentId: ID!
			amount: Float!
			paymentMethod: String
			note: String
		): Order
		setLayawayPickedUp(id: ID!, pickedUp: Boolean!): Order
		deleteOrder(id: ID!): DeleteResponse
	}
`;

export default orderDefs;
