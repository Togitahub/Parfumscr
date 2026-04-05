import gql from "graphql-tag";

export const CREATE_EXPENSE = gql`
	mutation CreateExpense(
		$storeId: ID!
		$amount: Float!
		$category: String!
		$description: String!
		$date: String
		$notes: String
	) {
		createExpense(
			storeId: $storeId
			amount: $amount
			category: $category
			description: $description
			date: $date
			notes: $notes
		) {
			id
			amount
			category
			description
			date
			notes
			createdAt
		}
	}
`;

export const UPDATE_EXPENSE = gql`
	mutation UpdateExpense(
		$id: ID!
		$amount: Float
		$category: String
		$description: String
		$date: String
		$notes: String
	) {
		updateExpense(
			id: $id
			amount: $amount
			category: $category
			description: $description
			date: $date
			notes: $notes
		) {
			id
			amount
			category
			description
			date
			notes
			createdAt
		}
	}
`;

export const DELETE_EXPENSE = gql`
	mutation DeleteExpense($id: ID!) {
		deleteExpense(id: $id) {
			success
			message
		}
	}
`;
