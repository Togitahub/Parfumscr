import gql from "graphql-tag";

const userDefs = gql`
	type User {
		id: ID!
		name: String!
		email: String!
		role: String!
		phone: String
		address: String
		active: Boolean
	}

	type AuthResponse {
		token: String!
		user: User!
		isDefaultAdmin: Boolean!
	}

	type MessageResponse {
		success: Boolean!
		message: String!
	}

	type Query {
		getUser(id: ID!): User
		getUsers: [User]
	}

	type Mutation {
		register(
			name: String!
			email: String!
			password: String!
			role: String
			phone: String
			address: String
		): User!
		login(email: String!, password: String!): AuthResponse!
		logout: MessageResponse!
		updateUser(
			id: ID!
			name: String
			email: String
			role: String
			phone: String
			address: String
		): User!
		deleteUser(id: ID!): DeleteResponse!
		toggleUserActive(id: ID!, active: Boolean!): User!
		requestPasswordReset(email: String!): MessageResponse!
		resetPassword(token: String!, newPassword: String!): MessageResponse!
		changePassword(
			currentPassword: String!
			newPassword: String!
		): MessageResponse!
	}
`;

export default userDefs;
