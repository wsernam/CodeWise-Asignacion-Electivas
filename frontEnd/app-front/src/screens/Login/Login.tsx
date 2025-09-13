import { useState } from "react";
import { useNavigate } from "react-router";

const Login:React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const navigate = useNavigate();

    const handleLogin = () => {
        //dummy login
        navigate('/electives');
    }
    
    return <div>
        <h1>Login</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
    </div>
}

export default Login;