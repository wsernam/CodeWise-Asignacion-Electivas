// src/components/layout/Header/Header.tsx
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Escudo a la izquierda extrema */}
        <div className="header-left">
          <img
            src="src/assets/escudouni.png"
            alt="Escudo Universidad del Cauca"
            className="escudo-img"
          />
        </div>

        {/* Información a la derecha extrema */}
        <div className="header-right">
          <h1 className="header-title">Sistema de Inscripción de Electivas</h1>
          <p className="header-subtitle">Universidad del Cauca</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
