import gql from "graphql-tag";

export const CREATE_SEGMENT = gql`
	mutation ($name: String!) {
		createSegment(name: $name) {
			id
			name
		}
	}
`;

export const UPDATE_SEGMENT = gql`
	mutation ($id: ID!, $name: String!) {
		updateSegment(id: $id, name: $name) {
			id
			name
		}
	}
`;

export const DELETE_SEGMENT = gql`
	mutation ($id: ID!) {
		deleteSegment(id: $id) {
			success
			message
		}
	}
`;
