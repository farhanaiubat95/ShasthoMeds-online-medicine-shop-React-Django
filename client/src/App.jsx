import Header from "./components/Header/Header.jsx";
import Routers from "./routers/Routers.jsx";
import "./App.css";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./routers/ScrollToTop.jsx";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUserData } from "./redux/userSlice.js";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "./redux/productSlice.js";
import { fetchCategories } from "./redux/categorySlice.js";
import { fetchBrands } from "./redux/brandSlice.js";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (access_token && refresh_token && user) {
      dispatch(setUserData({ user, access_token, refresh_token }));
    }
  }, [dispatch]);

  // Fetch products
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);


  const isAdminRoute = location.pathname.startsWith("/admin-dashboard");

  return (
    <>
      <ScrollToTop />
      <div className={!isAdminRoute ? "mx-5 sm:mx-10 lg:mx-12 xl:mx-24" : ""}>
        {!isAdminRoute ? <Header /> : ""}
        <Routers />
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}

export default App;
