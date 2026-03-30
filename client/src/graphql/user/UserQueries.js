import gql from "graphql-tag";

export const GET_USERS = gql`
	query GetUsers {
		getUsers {
			id
			name
			email
			role
			phone
			address
		}
	}
`;

export const GET_USER = gql`
	query GetUser($id: ID!) {
		getUser(id: $id) {
			id
			name
			email
			role
			phone
			address
		}
	}
`;
