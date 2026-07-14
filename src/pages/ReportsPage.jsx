import { useEffect, useState } from "react";
import { getDailySalesReport, getLowStockProducts } from "../services/api";
import "../App.css";

function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyReport, setDailyReport] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [threshold, setThreshold] = useState(5);
  const [message, setMessage] = useState("");
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  useEffect(() => {
    loadDailySalesReport();
    loadLowStockProducts();
  }, []);

  async function loadDailySalesReport() {
    try {
      setLoadingSales(true);
      setMessage("");

      const data = await getDailySalesReport(selectedDate);
      setDailyReport(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingSales(false);
    }
  }

  async function loadLowStockProducts() {
    try {
      setLoadingLowStock(true);
      setMessage("");

      const data = await getLowStockProducts(threshold);
      setLowStockProducts(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingLowStock(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Reports</h1>

      {message && <div className="error-message">{message}</div>}

      <div className="reports-layout">
        <div className="report-card">
          <h2>Daily Sales Report</h2>

          <div className="report-filter">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button onClick={loadDailySalesReport}>Load Report</button>
          </div>

          {loadingSales && <p>Loading sales report...</p>}

          {!loadingSales && dailyReport && (
            <div className="report-summary-box">
              <p>
                <strong>Date:</strong>{" "}
                {new Date(dailyReport.date).toLocaleDateString()}
              </p>

              <p>
                <strong>Total Transactions:</strong>{" "}
                {dailyReport.totalTransactions}
              </p>

              <p>
                <strong>Total Sales Amount:</strong>{" "}
                {dailyReport.totalSalesAmount.toFixed(2)}
              </p>

              <p>
                <strong>Total VAT Amount:</strong>{" "}
                {dailyReport.totalVatAmount.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="report-card">
          <h2>Low Stock Products</h2>

          <div className="report-filter">
            <label>Stock Threshold</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />

            <button onClick={loadLowStockProducts}>Load Low Stock</button>
          </div>

          {loadingLowStock && <p>Loading low stock products...</p>}

          {!loadingLowStock && lowStockProducts.length === 0 && (
            <p>No low-stock products found.</p>
          )}

          {!loadingLowStock && lowStockProducts.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Product</th>
                  <th>Stock Quantity</th>
                </tr>
              </thead>

              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.barcode}</td>
                    <td>{product.productName}</td>
                    <td>{product.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;