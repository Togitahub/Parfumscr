import gql from "graphql-tag";

const favoritesDefs = gql`
	type Favorites {
		id: ID!
		user: User!
		products: [Product!]!
	}

	type Query {
		getUserFavorites(userId: ID!): Favorites
	}

	type Mutation {
		addToFavorites(userId: ID!, productId: ID!): Favorites
		removeFromFavorites(userId: ID!, productId: ID!): DeleteResponse
	}
`;

export default favoritesDefs;
