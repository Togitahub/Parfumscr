import { Routes, Route } from "react-router-dom";

import AuthView from "./views/AuthView";
import HomeView from "./views/HomeView";
import AdminView from "./views/AdminView";
import CartView from "./views/CartView";
import OrderView from "./views/OrderViewV2";
import OrdersView from "./views/OrdersView";
import ProductView from "./views/ProductView";
import EntityView from "./views/EntityView";
import FavoritesView from "./views/FavoritesView";
import StoreView from "./views/StoreView";
import ProfileView from "./views/ProfileView";
import DashboardView from "./views/DashboardView";

import NavBar from "./components/design/Navbar";
import Footer from "./components/design/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";
import TokenWatcher from "./routes/TokenWatcher";
import ScrollToTop from "./routes/ScrollToTop";
import NotFoundView from "./views/NotFoundView";
import LandingNavbar from "./components/design/LandingNavbar";

import { useAuth } from "./hooks/AuthContext";
import { useStore } from "./hooks/StoreContext";

const App = () => {
	const { user } = useAuth();
	const { store, storeNotFound } = useStore();

	const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

	if (storeNotFound && !store) return <NotFoundView />;

	return (
		<div className="flex flex-col min-h-screen">
			<ScrollToTop />
			<TokenWatcher />

			{store ? <NavBar /> : <LandingNavbar />}

			<main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
				<Routes>
					{/* ── Públicas ── */}
					<Route path="/" element={isAdmin ? <AdminView /> : <HomeView />} />
					<Route path="/store" element={<StoreView />} />
					<Route path="/auth" element={<AuthView />} />
					<Route path="/store/product/:id" element={<ProductView />} />

					<Route
						path="/store/brand/:id"
						element={<EntityView type="brand" />}
					/>

					<Route
						path="/store/segment/:id"
						element={<EntityView type="segment" />}
					/>

					<Route
						path="/store/category/:id"
						element={<EntityView type="category" />}
					/>

					<Route path="/store/note/:id" element={<EntityView type="note" />} />

					<Route path="/store/cart" element={<CartView />} />

					{/* ── Protegidas (usuario autenticado) ── */}
					<Route element={<ProtectedRoute />}>
						<Route path="/store/orders" element={<OrdersView />} />
						<Route path="/store/orders/:id" element={<OrderView />} />
						<Route path="/store/favorites" element={<FavoritesView />} />
						<Route path="/profile" element={<ProfileView />} />
					</Route>

					{/* ── Protegidas (admin) ── */}
					<Route element={<ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} />}>
						<Route path="/admin" element={<AdminView />} />
						<Route path="/dashboard" element={<DashboardView />} />
					</Route>

					{/* ── Fallback ── */}
					<Route path="*" element={<NotFoundView />} />
				</Routes>
			</main>

			<Footer />
		</div>
	);
};

export default App;
