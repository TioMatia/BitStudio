import React from "react";
import {Outlet } from "react-router-dom";
import Forbidden from "../pages/Control/Forbidden";

const PrivateRouteAdmin: React.FC = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Forbidden />;
  }

  return <Outlet />; 
};

export default PrivateRouteAdmin;