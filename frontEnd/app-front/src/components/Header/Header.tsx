import "./Header.css";
import logoUnicauca from "../../assets/logo-unicauca.png";
import logoUnicaucaBnw from "../../assets/logo-unicauca-claro.png";

const Header: React.FC = () => {
  return (
    <header className="header">
      <img src={logoUnicaucaBnw} alt="Logo Unicauca" className="logo" />
      <h1>Sistema de Inscripción de Electivas</h1>
    </header>
  );
};

export default Header;
