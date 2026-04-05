import gql from "graphql-tag";

const expenseDefs = gql`
	type Expense {
		id: ID!
		store: ID!
		amount: Float!
		category: String!
		description: String!
		date: String!
		notes: String
		createdAt: String!
	}

	type ExpenseSummary {
		totalExpenses: Float!
		byCategory: [CategoryExpense!]!
	}

	type CategoryExpense {
		category: String!
		total: Float!
		count: Int!
	}

	type MonthlyFinancial {
		month: String!
		revenue: Float!
		expenses: Float!
		profit: Float!
	}

	type Query {
		getExpenses(storeId: ID!, period: String): [Expense!]!
		getExpenseSummary(storeId: ID!, period: String): ExpenseSummary!
	}

	type Mutation {
		createExpense(
			storeId: ID!
			amount: Float!
			category: String!
			description: String!
			date: String
			notes: String
		): Expense!

		updateExpense(
			id: ID!
			amount: Float
			category: String
			description: String
			date: String
			notes: String
		): Expense!

		deleteExpense(id: ID!): DeleteResponse!
	}
`;

export default expenseDefs;
