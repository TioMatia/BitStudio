import React from "react";
import {Outlet } from "react-router-dom";
import Forbidden from "../pages/Forbidden";

const PrivateRouteComprador: React.FC = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "comprador") {
    return <Forbidden />;
  }

  return <Outlet />; 
};

export default PrivateRouteComprador;