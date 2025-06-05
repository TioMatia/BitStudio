import React from "react";

const Forbidden: React.FC = () => {
  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "3rem"}}>
        ERROR 403 - Forbidden
        </h1>
      <p>No tienes permisos para acceder a esta sección.</p>
    </div>
  );
};

export default Forbidden;
