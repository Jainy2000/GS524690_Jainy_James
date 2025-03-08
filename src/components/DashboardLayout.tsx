import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../styles/DashboardLayout.css";
import logo from "../assets/logo.svg"; // Importing the app logo
import { BiStore } from "react-icons/bi";
import { TbTriangleSquareCircle } from "react-icons/tb";
import { BiSolidBarChartSquare } from "react-icons/bi";
import { HiOutlineChartSquareBar } from "react-icons/hi";

interface DashboardLayoutProps {
  children?: React.ReactNode; // Defining optional children prop for component
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleLogout = () => {
    console.log("called");
    localStorage.removeItem("authToken"); // Clearing authentication token on logout
    navigate("/"); // Redirecting user to the login page
  };

  return (
    <div className="gs-dashboard-container">
      {/* Top bar with logo, title, and logout button */}
      <header className="gs-top-bar">
        <div className="gs-logo">
          <img src={logo} alt="App Logo" />
        </div>
        <h1 className="gs-title">Data Viewer App</h1>
        <button onClick={handleLogout} className="gs-log-btn">Logout</button>
      </header>

      {/* Main layout containing sidebar and content */}
      <div className="gs-dashboard-content">
        {/* Sidebar navigation menu */}
        <nav className="gs-sidebar">
          <ul>
            <li>
              <NavLink
                to="/store"
                className={({ isActive }) => (isActive ? "gs-nav-link active" : "gs-nav-link")}
              >
                <BiStore size={15} /> Store
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/sku"
                className={({ isActive }) => (isActive ? "gs-nav-link active" : "gs-nav-link")}
              >
                <TbTriangleSquareCircle size={15} /> SKU
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/planning"
                className={({ isActive }) => (isActive ? "gs-nav-link active" : "gs-nav-link")}
              >
                <BiSolidBarChartSquare size={15} /> Planning
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/charts"
                className={({ isActive }) => (isActive ? "gs-nav-link active" : "gs-nav-link")}
              >
                <HiOutlineChartSquareBar size={15} /> Charts
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Main content area for displaying child components or routed content */}
        <main className="gs-content">
          {children || <Outlet />} {/* Rendering either passed children or nested route components */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;