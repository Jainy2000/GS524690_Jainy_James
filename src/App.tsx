import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import Store from "./components/Store";
import SKU from "./components/SKU";
import Planning from "./components/Planning";
import Charts from "./components/Charts";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Dashboard Layout with Nested Routes */}
        <Route path="/*" element={<DashboardLayout />}>
          <Route path="store" element={<Store />} />
          <Route path="sku" element={<SKU />} />
          <Route path="planning" element={<Planning />} />
          <Route path="charts" element={<Charts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
