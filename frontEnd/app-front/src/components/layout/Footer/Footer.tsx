// src/components/layout/Footer/Footer.tsx
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        © 2025 — Universidad del Cauca · ver. 2.2.1.0 ·{" "}
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
