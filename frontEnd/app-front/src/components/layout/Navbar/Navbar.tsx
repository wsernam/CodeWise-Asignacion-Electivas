import React from "react";
import { Link, useLocation } from "react-router";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link
        to="/dashboard"
        className={location.pathname.startsWith("/dashboard") ? "active" : ""}
      >
        Inicio
      </Link>
      <Link
        to="/electives"
        className={location.pathname.startsWith("/electives") ? "active" : ""}
      >
        Electivas
      </Link>
      <Link
        to="/form-admin"
        className={location.pathname.startsWith("/form-admin") ? "active" : ""}
      >
        Formulario
      </Link>
      <Link
        to="/programs"
        className={location.pathname.startsWith("/programs") ? "active" : ""}
      >
        Programas
      </Link>
      <Link
        to="/reportes"
        className={location.pathname.startsWith("/reportes") ? "active" : ""}
      >
        Generar reportes
      </Link>
    </nav>
  );
};

export default Navbar;
