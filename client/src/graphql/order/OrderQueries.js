import gql from "graphql-tag";

const ORDER_FIELDS = gql`
	fragment OrderFields on Order {
		id
		user
		store
		orderItems {
			productId
			name
			quantity
			price
		}
		totalPrice
		status
		createdAt
		confirmedAt
		finalPrice
		purchaseMode
		paymentMethod
		amountPaid
		balanceDue
		stockDiscounted
		installmentCount
		installments {
			id
			number
			expectedAmount
			paidAmount
			remainingAmount
			status
			paymentMethod
			note
		}
		layawayDays
		layawayDeadline
		layawayPickedUp
		layawayPayments {
			id
			amount
			paymentMethod
			note
			createdAt
			updatedAt
		}
	}
`;

export const GET_MY_ORDERS = gql`
	query GetMyOrders($userId: ID!) {
		getMyOrders(userId: $userId) {
			...OrderFields
		}
	}
	${ORDER_FIELDS}
`;

export const GET_ORDER_BY_ID = gql`
	query GetOrderById($id: ID!) {
		getOrderById(id: $id) {
			...OrderFields
		}
	}
	${ORDER_FIELDS}
`;

export const GET_ALL_ORDERS = gql`
	query GetAllOrders {
		getAllOrders {
			...OrderFields
		}
	}
	${ORDER_FIELDS}
`;
