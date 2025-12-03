import "./NextButton.css";

interface NextButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
  disabled?: boolean;
}

const NextButton: React.FC<NextButtonProps> = ({
  onClick,
  text = "Siguiente",
  className = "",
  disabled = false,
}) => {
  return (
    <button
      className={`next-button ${className} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default NextButton;
