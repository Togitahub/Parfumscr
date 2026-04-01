import gql from "graphql-tag";

export const GET_MY_STORE = gql`
	query {
		getMyStore {
			id
			slug
			customDomain
			storeName
			colorMain
			colorFirst
			colorSecond
			logo
			whatsapp
			facebook
			instagram
			active
			heroTagline
			heroDescription
			heroBadge1
			heroBadge2
		}
	}
`;

export const GET_STORE_PRODUCTS = gql`
	query GetStoreProducts($storeId: ID!) {
		getStoreProducts(storeId: $storeId) {
			id
			active
			price
			stock
			discount
			product {
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
				size
				isDecant
				createdAt
			}
		}
	}
`;

export const GET_STORES = gql`
	query {
		getStores {
			id
			slug
			customDomain
			storeName
			colorMain
			colorSecond
			logo
		}
	}
`;
