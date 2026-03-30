import gql from "graphql-tag";

export const CREATE_ORDER = gql`
	mutation ($userId: ID!, $totalPrice: Float!, $items: [String]!) {
		createOrder(userId: $userId, totalPrice: $totalPrice, items: $items) {
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
