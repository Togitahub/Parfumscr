import gql from "graphql-tag";

export const GET_MY_ORDERS = gql`
	query GetMyOrders($userId: ID!) {
		getMyOrders(userId: $userId) {
			id
			user
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

export const GET_ORDER_BY_ID = gql`
	query GetOrderById($id: ID!) {
		getOrderById(id: $id) {
			id
			user
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

export const GET_ALL_ORDERS = gql`
	query GetAllOrders {
		getAllOrders {
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
