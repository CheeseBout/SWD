import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextObject';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <Outlet />
        </main>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
      <Footer />
    </AuthProvider>
  );
}

export default App;
