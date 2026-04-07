import gql from "graphql-tag";

export const GET_USER_FAVORITES = gql`
	query ($userId: ID!) {
		getUserFavorites(userId: $userId) {
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
