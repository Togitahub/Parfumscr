import gql from "graphql-tag";

const segmentDefs = gql`
	type Segment {
		id: ID!
		name: String!
		products: [Product!]!
	}

	type Query {
		getSegment(id: ID!): Segment!
		getSegments: [Segment]
	}

	type Mutation {
		createSegment(name: String!): Segment!
		updateSegment(id: ID!, name: String!): Segment!
		deleteSegment(id: ID!): DeleteResponse!
	}
`;

export default segmentDefs;
