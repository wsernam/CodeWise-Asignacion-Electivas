// src/components/ui/BackButton/BackButton.tsx
import "./BackButton.css";

interface BackButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  text = "Volver",
  className = "",
}) => {
  return (
    <button className={`back-button ${className}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default BackButton;
