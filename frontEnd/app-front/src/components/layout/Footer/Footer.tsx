// src/components/layout/Footer/Footer.tsx
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        © 2025 — Universidad del Cauca·{"  "}
        <a href="#" className="footer-link">
          Política de privacidad
        </a>{" "}
        ·{" "}
        <a href="#" className="footer-link">
          Términos y condiciones
        </a>
      </div>
    </footer>
  );
};

export default Footer;
