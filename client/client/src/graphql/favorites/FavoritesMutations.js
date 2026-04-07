import gql from "graphql-tag";

export const ADD_FAVORITE = gql`
	mutation ($userId: ID!, $productId: ID!) {
		addToFavorites(userId: $userId, productId: $productId) {
			id
			products {
				id
				name
				brand {
					id
					name
				}
				category {
					id
					name
				}
				segment {
					id
					name
				}
				notes {
					id
					name
				}
				price
				stock
				images
				size
				isDecant
				createdAt
			}
		}
	}
`;

export const REMOVE_FAVORITE = gql`
	mutation ($userId: ID!, $productId: ID!) {
		removeFromFavorites(userId: $userId, productId: $productId) {
			success
			message
		}
	}
`;
