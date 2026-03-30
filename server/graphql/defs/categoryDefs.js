import gql from "graphql-tag";

const categoryDefs = gql`
	type Category {
		id: ID!
		name: String!
		products: [Product!]!
	}

	type Query {
		getCategory(id: ID!): Category!
		getCategories: [Category]
	}

	type Mutation {
		createCategory(name: String!): Category!
		updateCategory(id: ID!, name: String!): Category!
		deleteCategory(id: ID!): DeleteResponse!
	}
`;

export default categoryDefs;
