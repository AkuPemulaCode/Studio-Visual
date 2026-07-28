import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";
import WhatsAppButton from "./assets/components/WhatsappButton";

import Home from "./assets/pages/Home";
import Category from "./assets/pages/Category";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
        <Navbar />

        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kategori" element={<Category />} />
            <Route path="/kategori/:slug" element={<Category />} />
          </Routes>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}
