import gql from "graphql-tag";

export const GET_BRANDS = gql`
	query {
		getBrands {
			id
			name
		}
	}
`;

export const GET_BRAND = gql`
	query ($id: ID!) {
		getBrand(id: $id) {
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
