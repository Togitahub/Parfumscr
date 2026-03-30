import gql from "graphql-tag";
const noteDefs = gql`
	type Note {
		id: ID!
		name: String!
		products: [Product!]!
	}
	type Query {
		getNote(id: ID!): Note!
		getNotes: [Note]
	}
	type Mutation {
		createNote(name: String!): Note!
		updateNote(id: ID!, name: String!): Note!
		deleteNote(id: ID!): DeleteResponse!
	}
`;
export default noteDefs;
