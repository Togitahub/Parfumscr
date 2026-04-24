import gql from "graphql-tag";

export const GET_NOTES = gql`
	query {
		getNotes {
			id
			name
		}
	}
`;

export const GET_NOTE = gql`
	query ($id: ID!) {
		getNote(id: $id) {
			id
			name
			products {
				id
				name
				price
				images
				isDecant
				brand {
					id
					name
				}
				segment {
					id
					name
				}
				category {
					id
					name
				}
				notes {
					id
					name
				}
			}
		}
	}
`;
