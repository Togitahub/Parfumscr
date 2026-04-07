import gql from "graphql-tag";

export const CREATE_PRODUCT = gql`
	mutation CreateProduct(
		$name: String!
		$brand: String!
		$category: ID!
		$segment: ID!
		$price: Float!
		$stock: Int
		$images: [String!]!
		$description: String
		$size: String
		$notes: [ID]
		$isDecant: Boolean
		$linkedProduct: ID
		$decants: [DecantInput]
	) {
		createProduct(
			name: $name
			brand: $brand
			category: $category
			segment: $segment
			price: $price
			stock: $stock
			images: $images
			description: $description
			size: $size
			notes: $notes
			isDecant: $isDecant
			linkedProduct: $linkedProduct
			decants: $decants
		) {
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
			decants {
				id
				name
				size
				price
				stock
			}
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct(
		$id: ID!
		$name: String
		$brand: String
		$category: ID
		$segment: ID
		$price: Float
		$stock: Int
		$images: [String]
		$description: String
		$size: String
		$notes: [ID]
		$isDecant: Boolean
		$linkedProduct: ID
	) {
		updateProduct(
			id: $id
			name: $name
			brand: $brand
			category: $category
			segment: $segment
			price: $price
			stock: $stock
			images: $images
			description: $description
			size: $size
			notes: $notes
			isDecant: $isDecant
			linkedProduct: $linkedProduct
		) {
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
			linkedProduct {
				id
				name
			}
			createdAt
		}
	}
`;

export const DELETE_PRODUCT = gql`
	mutation DeleteProduct($id: ID!) {
		deleteProduct(id: $id) {
			success
			message
		}
	}
`;
