import gql from "graphql-tag";

export const GET_EXPENSES = gql`
	query GetExpenses($storeId: ID!, $period: String) {
		getExpenses(storeId: $storeId, period: $period) {
			id
			store
			amount
			category
			description
			date
			notes
			createdAt
		}
	}
`;

export const GET_EXPENSE_SUMMARY = gql`
	query GetExpenseSummary($storeId: ID!, $period: String) {
		getExpenseSummary(storeId: $storeId, period: $period) {
			totalExpenses
			byCategory {
				category
				total
				count
			}
		}
	}
`;
