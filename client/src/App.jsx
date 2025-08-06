// Components
import Header from "./components/Header/Header.jsx";
import Routers from "./routers/Routers.jsx";
// import CssBaseline from '@mui/material/CssBaseline';
import "./App.css";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./routers/ScrollToTop.jsx";
import { useDispatch } from "react-redux";

function App() {
  // Redux
  const dispatch = useDispatch();

  // Check if user is logged in
  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (access && refresh && user) {
      dispatch(setUserData({ user, access, refresh }));
    }
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <div className="mx-5 sm:mx-10 lg:mx-15 xl:mx-30">
        <Header />
        <Routers />
        <Footer />
      </div>
    </>
  );
}
export default App;
