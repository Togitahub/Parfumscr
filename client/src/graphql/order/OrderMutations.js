import gql from "graphql-tag";

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
				name
				quantity
				price
			}
			totalPrice
			status
			createdAt
		}
	}
`;

export const UPDATE_ORDER_STATUS = gql`
	mutation UpdateOrderStatus($id: ID!, $status: String!, $finalPrice: Float) {
		updateOrderStatus(id: $id, status: $status, finalPrice: $finalPrice) {
			id
			status
			finalPrice
			confirmedAt
		}
	}
`;

export const DELETE_ORDER = gql`
	mutation DeleteOrder($id: ID!) {
		deleteOrder(id: $id) {
			success
			message
		}
	}
`;
