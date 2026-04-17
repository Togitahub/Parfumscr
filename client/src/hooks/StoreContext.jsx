import { useNavigate, useLocation } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [store, setStore] = useState(null);
	const [loadingStore, setLoadingStore] = useState(true);
	const [storeNotFound, setStoreNotFound] = useState(false);

	const setFavicon = (url) => {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		link.href = url;
	};

	useEffect(() => {
		const fetchStoreConfig = async () => {
			try {
				const host = window.location.hostname;
				const parts = host.split(".");
				const isRootDomain = parts.length <= 2;
				const subdomain = !isRootDomain ? parts[0] : null;
				const slug = subdomain ?? import.meta.env.VITE_STORE_SLUG ?? null;

				if (!slug) {
					setLoadingStore(false);
					return;
				}

				const url = `${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/store-config?slug=${slug}`;

				const res = await fetch(url, {
					headers: { Host: host },
				});

				if (!res.ok) {
					setStoreNotFound(true);
					document.title = "Parfumsoft";
					return;
				}

				const data = await res.json();

				document.documentElement.style.setProperty(
					"--color-main",
					data.colorMain,
				);
				document.documentElement.style.setProperty(
					"--color-first",
					data.colorFirst,
				);
				document.documentElement.style.setProperty(
					"--color-second",
					data.colorSecond,
				);

				setStore(data);
				document.title = data.storeName ?? "Parfumsoft";

				if (data.logo) setFavicon(data.logo);
			} catch (err) {
				console.error("StoreContext error:", err.message);
			} finally {
				setLoadingStore(false);
			}
		};

		fetchStoreConfig();
	}, []); // <- solo al montar

	// Manejo de redirect separado
	useEffect(() => {
		if (
			!loadingStore &&
			store &&
			!storeNotFound &&
			(location.pathname === "/" || location.pathname === "")
		) {
			navigate("/store", { replace: true });
		}
	}, [loadingStore, store, location.pathname, navigate, storeNotFound]);

	return (
		<StoreContext.Provider value={{ store, loadingStore, storeNotFound }}>
			{children}
		</StoreContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => {
	const ctx = useContext(StoreContext);
	if (!ctx) throw new Error("useStore must be used within a StoreProvider");
	return ctx;
};
