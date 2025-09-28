import { useNavigate } from "react-router";

import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import RoleCard from "../../components/shared/RoleCard/RoleCard";

import "./PreLogin.css";

/**
 * COMPONENTE: PreLogin
 * Pantalla de bienvenida que permite seleccionar entre estudiante y administrativo
 * Es la puerta de entrada a la aplicación
 */
const PreLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      {/* Header de la aplicación */}
      <Header />

      {/* Contenido principal centrado */}
      <div className="auth-page-content">
        <main className="prelogin-main">
          {/* Título y descripción */}
          <h2>Por favor, selecciona tu rol</h2>
          <p>Sistema de preinscripción de electivas - Universidad del Cauca</p>

          {/* Contenedor de las tarjetas de rol */}
          <div className="roles-container">
            {/*
             * ROLE CARD - ESTUDIANTE
             * label: Texto que muestra la tarjeta
             * iconType: Tipo de ícono a mostrar (definido en RoleCard)
             * onClick: Función que se ejecuta al hacer clic
             */}
            <RoleCard
              label="Estudiante"
              iconType="student"
              onClick={() => navigate("/login-student")}
            />

            {/*
             * ROLE CARD - ADMINISTRATIVO
             * Navega al login con usuario y contraseña
             */}
            <RoleCard
              label="Administrativo"
              iconType="admin"
              onClick={() => navigate("/login-admin")}
            />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PreLogin;
