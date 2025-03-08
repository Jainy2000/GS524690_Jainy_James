import { useState } from "react"; // Importing useState for managing form state
import { useNavigate } from "react-router-dom"; // Importing useNavigate for navigation
import "../styles/login.css"; // Importing CSS for styling

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>(""); // State for username input
  const [password, setPassword] = useState<string>(""); // State for password input
  const navigate = useNavigate(); // Hook for programmatic navigation

  const correctUsername = "admin"; // Hardcoded username for authentication
  const correctPassword = "password123"; // Hardcoded password for authentication

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents default form submission behavior

    // Checking credentials
    if (username === correctUsername && password === correctPassword) {
      localStorage.setItem("authToken", "loggedIn"); // Storing authentication token
      navigate("/store"); // Redirecting to the dashboard after successful login
    } else {
      alert("Invalid credentials"); // Displaying alert for incorrect login details
    }
  };

  return (
    <div className="login-container">
      <span>Login</span> {/* Title of the login form */}
      <form onSubmit={handleLogin}> {/* Form submission handling */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Updating username state on input change
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Updating password state on input change
          required
        />
        <button type="submit">Login</button> {/* Login button */}
      </form>
    </div>
  );
};

export default Login;