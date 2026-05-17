import React from "react";
import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";

import { LoginPage }           from "./pages/auth/LoginPage";
import { RegisterPage }        from "./pages/auth/RegisterPage";
import { ForgotPasswordlPage } from "./pages/auth/ForgotPasswordlPage";
import { PrivateRoute }        from "./routes/PrivateRoute";
import { Index }               from "./pages/Index";
import { CategoryShow }        from "./pages/category/CategoryShow";
import { ProductShow }         from "./pages/product/ProductShow";
import { CartShow }            from "./pages/cart/CartShow";
import { CheckoutShow }                from "./pages/checkout/CheckoutShow";
import { CheckoutShippingAddressShow } from "./pages/checkout/CheckoutShippingAddressShow";
import { CheckoutShippingShow }        from "./pages/checkout/CheckoutShippingShow";
import { CheckoutPaymentShow }         from "./pages/checkout/CheckoutPaymentShow";
import { CheckoutSummaryShow }         from "./pages/checkout/CheckoutSummaryShow";
import { Profile }             from "./pages/user/Profile";
import { EditProfile }         from "./pages/user/EditProfile";
import { EditAddress }         from "./pages/user/EditAddress";
import { UserAddresses }       from "./pages/user/UserAddresses";
import { UserAddresseCreate }  from "./pages/user/UserAddresseCreate";
import { UserOrders }          from "./pages/user/UserOrders";
import { UserLogout }          from "./pages/user/UserLogout";

function App() {
  return (
    <Provider store={store}>
      <Routes>

        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/"                element={<Index />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordlPage />} />
        <Route path="/category/:slug"  element={<CategoryShow />} />
        <Route path="/product/:slug"   element={<ProductShow />} />
        <Route path="/cart"            element={<CartShow />} />

        {/* ── Protected ──────────────────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout"                  element={<CheckoutShow />} />
          <Route path="/checkout/shipping-address" element={<CheckoutShippingAddressShow />} />
          <Route path="/checkout/shipping"         element={<CheckoutShippingShow />} />
          <Route path="/checkout/payment"          element={<CheckoutPaymentShow />} />
          <Route path="/checkout/summary"          element={<CheckoutSummaryShow />} />
          <Route path="/user/profile"              element={<Profile />} />
          <Route path="/user/edit-profile"         element={<EditProfile />} />
          <Route path="/user/addresses"            element={<UserAddresses />} />
          <Route path="/user/addresses/create"     element={<UserAddresseCreate />} />
          <Route path="/user/addresses/:id/edit"   element={<EditAddress />} />
          <Route path="/user/orders"               element={<UserOrders />} />
          <Route path="/user/logout"               element={<UserLogout />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────── */}
        <Route path="*" element={<Index />} />

      </Routes>
    </Provider>
  );
}

export default App;