import { Routes, Route } from "react-router-dom"; // Importing routing components from react-router-dom
import DashboardLayout from "./DashboardLayout"; // Importing the main dashboard layout
import Store from "./Store"; // Importing Store component
import SKU from "./SKU"; // Importing SKU component
import Planning from "./Planning"; // Importing Planning component
import Charts from "./Charts"; // Importing Charts component

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Defining route structure within the DashboardLayout */}
      <Routes>
        <Route path="store" element={<Store />} /> {/* Route for Store page */}
        <Route path="sku" element={<SKU />} /> {/* Route for SKU page */}
        <Route path="planning" element={<Planning />} /> {/* Route for Planning page */}
        <Route path="charts" element={<Charts />} /> {/* Route for Charts page */}
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;