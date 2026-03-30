import gql from "graphql-tag";

export const CREATE_BRAND = gql`
	mutation ($name: String!) {
		createBrand(name: $name) {
			id
			name
		}
	}
`;

export const UPDATE_BRAND = gql`
	mutation ($id: ID!, $name: String!) {
		updateBrand(id: $id, name: $name) {
			id
			name
		}
	}
`;

export const DELETE_BRAND = gql`
	mutation ($id: ID!) {
		deleteBrand(id: $id) {
			success
			message
		}
	}
`;
