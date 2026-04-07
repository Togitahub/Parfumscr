import gql from "graphql-tag";

export const CREATE_CATEGORY = gql`
	mutation ($name: String!) {
		createCategory(name: $name) {
			id
			name
		}
	}
`;

export const UPDATE_CATEGORY = gql`
	mutation ($id: ID!, $name: String!) {
		updateCategory(id: $id, name: $name) {
			id
			name
		}
	}
`;

export const DELETE_CATEGORY = gql`
	mutation ($id: ID!) {
		deleteCategory(id: $id) {
			success
			message
		}
	}
`;
