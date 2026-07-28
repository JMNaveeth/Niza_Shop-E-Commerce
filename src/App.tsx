import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import CartDrawer from './components/Cart/CartDrawer'
import Toast from './components/Toast'
import MobileBottomNav from './components/MobileBottomNav'
import Home from './pages/Home'
import ProductDetailPage from './pages/ProductDetailPage'
import PhoneCoversPage from './pages/PhoneCoversPage'
import AdminPage from './pages/AdminPage'
import { PHONE_COVERS_PATH } from './lib/phoneBrands'

export default function App() {
  return (
    <div className="min-h-dvh min-h-screen bg-[#f8f7fb]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={PHONE_COVERS_PATH} element={<PhoneCoversPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <CartDrawer />
      <Toast />
      <MobileBottomNav />
    </div>
  )
}
