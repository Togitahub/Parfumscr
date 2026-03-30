import gql from "graphql-tag";

// Fragmento reutilizable con todos los campos de un producto
const PRODUCT_FIELDS = `
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
	notes {
		id
		name
	}
	price
	stock
	images
	description
	size
	isDecant
	createdAt
`;

export const GET_PRODUCTS = gql`
	query GetProducts {
		getProducts {
			${PRODUCT_FIELDS}
		}
	}
`;

// Solo perfumes (isDecant: false)
export const GET_PERFUMES = gql`
	query GetPerfumes {
		getProducts(isDecant: false) {
			${PRODUCT_FIELDS}
			decants {
				id
				name
				price
				stock
				size
				images
			}
		}
	}
`;

// Solo decants (isDecant: true)
export const GET_DECANTS = gql`
	query GetDecants {
		getProducts(isDecant: true) {
			${PRODUCT_FIELDS}
			linkedProduct {
				id
				name
				brand {
					id
					name
				}
			}
		}
	}
`;

export const GET_PRODUCT = gql`
	query GetProduct($id: ID!) {
		getProduct(id: $id) {
			${PRODUCT_FIELDS}
			linkedProduct {
				id
				name
				brand {
					id
					name
				}
				images
			}
			decants {
				id
				name
				price
				stock
				size
				images
			}
		}
	}
`;
