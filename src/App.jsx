import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextObject';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </AuthProvider>
  );
}

export default App;
