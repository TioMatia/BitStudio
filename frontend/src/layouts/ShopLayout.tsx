import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const ShopLayout: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default ShopLayout;
