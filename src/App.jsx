import { useState } from "react";
import PosPage from "./pages/PosPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import ReportsPage from "./pages/ReportsPage";

function App()
{
  const [activePage, setActivePage] = useState("pos");

  return(
    <>
      <nav className="app-navbar">
        <h2>Retail POS System</h2>

        <div>
          <button onClick={() => setActivePage("pos")}>POS Checkout</button>
          <button onClick={() => setActivePage("products")}>
            Product Management
          </button>
          <button onClick={() => setActivePage("reports")}>Reports</button>
        </div>
      </nav>

      {activePage === "pos" && <PosPage />}
      {activePage === "products" && <ProductManagementPage />}
      {activePage === "reports" && <ReportsPage />}
    </>
  );
}

export default App;