import gql from "graphql-tag";

const brandDefs = gql`
	type Brand {
		id: ID!
		name: String!
		products: [Product!]!
	}

	type Query {
		getBrand(id: ID!): Brand!
		getBrands: [Brand]
	}

	type Mutation {
		createBrand(name: String!): Brand!
		updateBrand(id: ID!, name: String!): Brand!
		deleteBrand(id: ID!): DeleteResponse!
	}
`;

export default brandDefs;
