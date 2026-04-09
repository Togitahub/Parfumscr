import gql from "graphql-tag";

const ORDER_MUTATION_FIELDS = gql`
	fragment OrderMutationFields on Order {
		id
		status
		finalPrice
		confirmedAt
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

export const CREATE_ORDER = gql`
	mutation ($userId: ID, $storeId: ID, $totalPrice: Float!, $items: [String]!) {
		createOrder(
			userId: $userId
			storeId: $storeId
			totalPrice: $totalPrice
			items: $items
		) {
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
			purchaseMode
			amountPaid
			balanceDue
		}
	}
`;

export const UPDATE_ORDER_STATUS = gql`
	mutation UpdateOrderStatus($id: ID!, $status: String!, $finalPrice: Float) {
		updateOrderStatus(id: $id, status: $status, finalPrice: $finalPrice) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const CONFIGURE_ORDER_PURCHASE = gql`
	mutation ConfigureOrderPurchase(
		$id: ID!
		$purchaseMode: String!
		$installmentCount: Int
		$layawayDays: Int
		$initialPayment: Float
		$paymentMethod: String
		$note: String
	) {
		configureOrderPurchase(
			id: $id
			purchaseMode: $purchaseMode
			installmentCount: $installmentCount
			layawayDays: $layawayDays
			initialPayment: $initialPayment
			paymentMethod: $paymentMethod
			note: $note
		) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const UPDATE_INSTALLMENT_PAYMENT = gql`
	mutation UpdateInstallmentPayment(
		$id: ID!
		$installmentId: ID!
		$paidAmount: Float!
		$paymentMethod: String
		$note: String
	) {
		updateInstallmentPayment(
			id: $id
			installmentId: $installmentId
			paidAmount: $paidAmount
			paymentMethod: $paymentMethod
			note: $note
		) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const ADD_LAYAWAY_PAYMENT = gql`
	mutation AddLayawayPayment(
		$id: ID!
		$amount: Float!
		$paymentMethod: String
		$note: String
	) {
		addLayawayPayment(
			id: $id
			amount: $amount
			paymentMethod: $paymentMethod
			note: $note
		) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const UPDATE_LAYAWAY_PAYMENT = gql`
	mutation UpdateLayawayPayment(
		$id: ID!
		$paymentId: ID!
		$amount: Float!
		$paymentMethod: String
		$note: String
	) {
		updateLayawayPayment(
			id: $id
			paymentId: $paymentId
			amount: $amount
			paymentMethod: $paymentMethod
			note: $note
		) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const SET_LAYAWAY_PICKED_UP = gql`
	mutation SetLayawayPickedUp($id: ID!, $pickedUp: Boolean!) {
		setLayawayPickedUp(id: $id, pickedUp: $pickedUp) {
			...OrderMutationFields
		}
	}
	${ORDER_MUTATION_FIELDS}
`;

export const DELETE_ORDER = gql`
	mutation DeleteOrder($id: ID!) {
		deleteOrder(id: $id) {
			success
			message
		}
	}
`;
