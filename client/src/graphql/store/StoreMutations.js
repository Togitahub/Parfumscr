import gql from "graphql-tag";

export const CREATE_STORE = gql`
	mutation CreateStore(
		$slug: String!
		$storeName: String!
		$whatsapp: String
		$facebook: String
		$instagram: String
		$logo: String
		$colorMain: String
		$colorFirst: String
		$colorSecond: String
		$heroTagline: String
		$heroDescription: String
		$heroBadge1: String
		$heroBadge2: String
	) {
		createStore(
			slug: $slug
			storeName: $storeName
			whatsapp: $whatsapp
			facebook: $facebook
			instagram: $instagram
			logo: $logo
			colorMain: $colorMain
			colorFirst: $colorFirst
			colorSecond: $colorSecond
			heroTagline: $heroTagline
			heroDescription: $heroDescription
			heroBadge1: $heroBadge1
			heroBadge2: $heroBadge2
		) {
			id
			slug
			storeName
		}
	}
`;

export const UPDATE_STORE = gql`
	mutation UpdateStore(
		$storeName: String
		$customDomain: String
		$whatsapp: String
		$facebook: String
		$instagram: String
		$logo: String
		$colorMain: String
		$colorFirst: String
		$colorSecond: String
		$heroTagline: String
		$heroDescription: String
		$heroBadge1: String
		$heroBadge2: String
	) {
		updateStore(
			storeName: $storeName
			customDomain: $customDomain
			whatsapp: $whatsapp
			facebook: $facebook
			instagram: $instagram
			logo: $logo
			colorMain: $colorMain
			colorFirst: $colorFirst
			colorSecond: $colorSecond
			heroTagline: $heroTagline
			heroDescription: $heroDescription
			heroBadge1: $heroBadge1
			heroBadge2: $heroBadge2
		) {
			id
			slug
			storeName
			colorMain
			colorFirst
			colorSecond
			logo
			whatsapp
			customDomain
		}
	}
`;

export const ADD_PRODUCT_TO_STORE = gql`
	mutation AddProductToStore($productId: ID!, $price: Float, $stock: Int, $discount: Float) {
		addProductToStore(productId: $productId, price: $price, stock: $stock, discount: $discount) {
			id
			active
			price
			stock
			discount
			product {
				id
				name
			}
		}
	}
`;

export const UPDATE_STORE_PRODUCT = gql`
	mutation UpdateStoreProduct($productId: ID!, $price: Float, $stock: Int, $discount: Float) {
		updateStoreProduct(productId: $productId, price: $price, stock: $stock, discount: $discount) {
			id
			price
			stock
			discount
			product {
				id
				name
			}
		}
	}
`;

export const REMOVE_PRODUCT_FROM_STORE = gql`
	mutation RemoveProductFromStore($productId: ID!) {
		removeProductFromStore(productId: $productId) {
			success
			message
		}
	}
`;

export const TOGGLE_STORE_PRODUCT = gql`
	mutation ToggleStoreProduct($productId: ID!, $active: Boolean!) {
		toggleStoreProduct(productId: $productId, active: $active) {
			id
			active
			product {
				id
				name
			}
		}
	}
`;
