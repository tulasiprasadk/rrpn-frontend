import SupplierEditProduct from "./supplier/EditProduct";



import Crackers from "./pages/Crackers";
import Products from "./pages/Products";
import SupplierForgotPassword from "./pages/SupplierForgotPassword";

import CustomerDashboard from "./pages/CustomerDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";

export const routes = [
  {
    path: "/crackers",
    element: <Crackers />
  },
  {
    path: "/products",
    element: <Products />
  },
  {
    path: "/supplier/forgot-password",
    element: <SupplierForgotPassword />
  },
  {
    path: "/supplier/dashboard",
    element: <SupplierDashboard />
  },
  {
    path: "/customer/dashboard",
    element: <CustomerDashboard />
  }
  ,
  {
    path: "/supplier/products/:id/edit",
    element: <SupplierEditProduct />
  }
];



