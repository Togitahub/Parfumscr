import gql from "graphql-tag";

export const GET_USER_CART = gql`
	query GetUserCart($userId: ID!) {
		getUserCart(userId: $userId) {
			id
			user
			items {
				product {
					id
					name
					brand {
						id
						name
					}
					price
					images
					size
					isDecant
				}
				quantity
			}
		}
	}
`;
