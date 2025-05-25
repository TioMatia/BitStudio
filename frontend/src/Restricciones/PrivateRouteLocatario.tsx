import React from "react";
import {Outlet } from "react-router-dom";
import Forbidden from "../pages/Forbidden";

const PrivateRouteLocatario: React.FC = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "vendedor") {
    return <Forbidden />;
  }

  return <Outlet />; 
};

export default PrivateRouteLocatario;