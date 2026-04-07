import gql from "graphql-tag";

export const GET_CATEGORIES = gql`
	query {
		getCategories {
			id
			name
		}
	}
`;

export const GET_CATEGORY = gql`
	query ($id: ID!) {
		getCategory(id: $id) {
			id
			name
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
				isDecant
				price
				stock
				images
				description
				size
				createdAt
			}
		}
	}
`;
