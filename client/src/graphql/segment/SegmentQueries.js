import gql from "graphql-tag";

export const GET_SEGMENTS = gql`
	query {
		getSegments {
			id
			name
		}
	}
`;

export const GET_SEGMENT = gql`
	query ($id: ID!) {
		getSegment(id: $id) {
			id
			name
			products {
				id
				name
				brand {
					id
					name
				}
				category {
					id
					name
				}
				segment {
					id
					name
				}
				price
				stock
				images
				description
				size
				createdAt
			}
		}
	}
`;
