import gql from "graphql-tag";

export const GET_EXPENSES = gql`
	query GetExpenses(
		$storeId: ID!
		$period: String
		$startDate: String
		$endDate: String
	) {
		getExpenses(
			storeId: $storeId
			period: $period
			startDate: $startDate
			endDate: $endDate
		) {
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
	query GetExpenseSummary(
		$storeId: ID!
		$period: String
		$startDate: String
		$endDate: String
	) {
		getExpenseSummary(
			storeId: $storeId
			period: $period
			startDate: $startDate
			endDate: $endDate
		) {
			totalExpenses
			byCategory {
				category
				total
				count
			}
		}
	}
`;
