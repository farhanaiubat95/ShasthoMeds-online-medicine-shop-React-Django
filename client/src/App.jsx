import Header from "./components/Header/Header.jsx";
import Routers from "./routers/Routers.jsx";
import "./App.css";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./routers/ScrollToTop.jsx";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUserData } from "./redux/userSlice.js";
import { useLocation } from "react-router-dom";
import { fetchOrders } from "./redux/orderSlice.js";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const user = JSON.parse(localStorage.getItem("user"));
    const authUser = useSelector((state) => state.auth.user);

    if (access_token && refresh_token && user) {
      dispatch(setUserData({ user, access_token, refresh_token })); // match keys in slice
    }
  }, [dispatch]);

  useEffect(() => {
    if (authUser?.access_token || access_token) {
      dispatch(fetchOrders());
    }
  }, [dispatch, authUser]);

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
