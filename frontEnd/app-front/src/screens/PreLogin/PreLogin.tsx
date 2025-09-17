import { useNavigate } from "react-router";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import RoleCard from "../../components/RoleCard/RoleCard";
import "./PreLogin.css";

const PreLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="prelogin-container">
      <Header />

      <main className="prelogin-main">
        <h2>Por favor, selecciona tu rol</h2>
        <p>Aquí va info ej: requisitos/pasos de cómo preinscribir una electiva</p>

        <div className="roles-container">
          <RoleCard
            label="Estudiante"
            icon="👨‍🎓"
            onClick={() => navigate("/login-student")}
          />
          <RoleCard
            label="Administrativo"
            icon="🧑‍💼"
            onClick={() => navigate("/login")}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreLogin;
