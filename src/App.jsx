import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
