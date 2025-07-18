import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/HeaderVendedor";

const SellerLayout: React.FC = () => {
  return (
    <> 
      <Header />
      <Outlet />
    </>
  );
};

export default SellerLayout;
