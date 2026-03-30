import gql from "graphql-tag";

export const REGISTER = gql`
	mutation Register(
		$name: String!
		$email: String!
		$password: String!
		$role: String
		$phone: String
		$address: String
	) {
		register(
			name: $name
			email: $email
			password: $password
			role: $role
			phone: $phone
			address: $address
		) {
			id
			name
			email
			role
			phone
			address
		}
	}
`;

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			isDefaultAdmin
			user {
				id
				name
				email
				role
				phone
				address
			}
		}
	}
`;

export const UPDATE_USER = gql`
	mutation UpdateUser(
		$id: ID!
		$name: String
		$email: String
		$role: String
		$phone: String
		$address: String
	) {
		updateUser(
			id: $id
			name: $name
			email: $email
			role: $role
			phone: $phone
			address: $address
		) {
			id
			name
			email
			role
			phone
			address
		}
	}
`;

export const DELETE_USER = gql`
	mutation DeleteUser($id: ID!) {
		deleteUser(id: $id) {
			success
			message
		}
	}
`;

export const REQUEST_PASSWORD_RESET = gql`
	mutation RequestPasswordReset($email: String!) {
		requestPasswordReset(email: $email) {
			success
			message
		}
	}
`;

export const RESET_PASSWORD = gql`
	mutation ResetPassword($token: String!, $newPassword: String!) {
		resetPassword(token: $token, newPassword: $newPassword) {
			success
			message
		}
	}
`;
