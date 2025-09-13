import "./button.css"


interface ButtonProps {
    onClick?: () => void;
    label: string;
}


const Button: React.FC<ButtonProps> = (props) => {
    return (
        <button className='button' onClick={props.onClick}>
            {props.label}
        </button>
    )
}

export default Button;
