// Components
import Header from './components/Header/Header.jsx';
import Routers from './routers/Routers.jsx';
// import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import Footer from './components/Footer.jsx';
import ScrollToTop from './routers/ScrollToTop.jsx';


function App() {
  return (
    <>
      <ScrollToTop />
      <div className='mx-5 sm:mx-10 lg:mx-15 xl:mx-30'>
        <Header />
        <Routers />
        <Footer />
      </div>
    </>
  );
}
export default App;