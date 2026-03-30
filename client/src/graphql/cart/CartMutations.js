import gql from "graphql-tag";

export const ADD_ITEM_TO_CART = gql`
	mutation AddItemToCart($userId: ID!, $productId: ID!, $quantity: Int!) {
		addItemToCart(userId: $userId, productId: $productId, quantity: $quantity) {
			id
			user
			items {
				product {
					id
					name
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

export const REMOVE_ITEM_FROM_CART = gql`
	mutation RemoveItemFromCart($userId: ID!, $productId: ID!) {
		removeItemFromCart(userId: $userId, productId: $productId) {
			success
			message
		}
	}
`;

export const CLEAR_CART = gql`
	mutation ClearCart($userId: ID!) {
		clearCart(userId: $userId) {
			success
			message
		}
	}
`;
