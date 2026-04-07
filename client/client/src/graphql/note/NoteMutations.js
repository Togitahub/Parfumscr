import gql from "graphql-tag";

export const CREATE_NOTE = gql`
	mutation ($name: String!) {
		createNote(name: $name) {
			id
			name
		}
	}
`;
export const UPDATE_NOTE = gql`
	mutation ($id: ID!, $name: String!) {
		updateNote(id: $id, name: $name) {
			id
			name
		}
	}
`;
export const DELETE_NOTE = gql`
	mutation ($id: ID!) {
		deleteNote(id: $id) {
			success
			message
		}
	}
`;
