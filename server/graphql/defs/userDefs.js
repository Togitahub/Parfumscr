import gql from "graphql-tag";

const userDefs = gql`
	type User {
		id: ID!
		name: String!
		email: String!
		role: String!
		phone: String
		address: String
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
		updateUser(
			id: ID!
			name: String
			email: String
			role: String
			phone: String
			address: String
		): User!
		deleteUser(id: ID!): DeleteResponse!
		requestPasswordReset(email: String!): MessageResponse!
		resetPassword(token: String!, newPassword: String!): MessageResponse!
	}
`;

export default userDefs;
