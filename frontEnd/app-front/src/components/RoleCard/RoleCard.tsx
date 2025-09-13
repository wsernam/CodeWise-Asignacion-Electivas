import "./RoleCard.css";

interface RoleCardProps {
    label: string;
    icon: string;
    onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ label, icon, onClick }) => {
  return (
    <div className="role-card" onClick={onClick}>
      <div className="role-icon">{icon}</div>
      <span>{label}</span>
    </div>
  );
};

export default RoleCard;