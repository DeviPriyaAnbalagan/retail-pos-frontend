import { useEffect, useState } from "react";
import {
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/api";
import "../App.css";

function ProductManagementPage() {
  const emptyForm = {
    barcode: "",
    name: "",
    price: "",
    vatPercentage: "",
    stockQuantity: ""
  };

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts("", 1);
  }, []);

  async function loadProducts(searchValue = searchText, page = pageNumber) {
    try {
      setLoading(true);
      setMessage("");

      const data = await searchProducts(searchValue, page, pageSize);

      setProducts(data.products);
      setPageNumber(data.pageNumber);
      setTotalPages(data.totalPages);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  function validateProductForm() {
    if (!formData.barcode.trim()) {
      setMessage("Barcode is required.");
      return false;
    }

    if (!formData.name.trim()) {
      setMessage("Product name is required.");
      return false;
    }

    if (Number(formData.price) <= 0) {
      setMessage("Price must be greater than 0.");
      return false;
    }

    if (Number(formData.vatPercentage) < 0) {
      setMessage("VAT percentage cannot be negative.");
      return false;
    }

    if (Number(formData.stockQuantity) < 0) {
      setMessage("Stock quantity cannot be negative.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const isValid = validateProductForm();

    if (!isValid) {
      return;
    }

    const productRequest = {
      barcode: formData.barcode.trim(),
      name: formData.name.trim(),
      price: Number(formData.price),
      vatPercentage: Number(formData.vatPercentage),
      stockQuantity: Number(formData.stockQuantity),
      isActive: true
    };

    try {
      setMessage("");

      if (editingProductId) {
        await updateProduct(editingProductId, productRequest);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(productRequest);
        setMessage("Product created successfully.");
      }

      setFormData(emptyForm);
      setEditingProductId(null);
      await loadProducts(searchText, pageNumber);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(product) {
    setEditingProductId(product.id);

    setFormData({
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      vatPercentage: product.vatPercentage,
      stockQuantity: product.stockQuantity
    });

    setMessage("");
  }

  function handleCancelEdit() {
    setEditingProductId(null);
    setFormData(emptyForm);
    setMessage("");
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to disable this product?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(id);
      setMessage("Product disabled successfully.");
      await loadProducts(searchText, pageNumber);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleSearch() {
    setPageNumber(1);
    loadProducts(searchText, 1);
  }

  function handleClearSearch() {
    setSearchText("");
    setPageNumber(1);
    loadProducts("", 1);
  }

  function goToPreviousPage() {
    if (pageNumber > 1) {
      const previousPage = pageNumber - 1;
      setPageNumber(previousPage);
      loadProducts(searchText, previousPage);
    }
  }

  function goToNextPage() {
    if (pageNumber < totalPages) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      loadProducts(searchText, nextPage);
    }
  }

  return (
    <div className="page-container">
      <h1>Product Management</h1>

      {message && <div className="error-message">{message}</div>}

      <div className="management-layout">
        <div className="product-form-section">
          <h2>{editingProductId ? "Update Product" : "Add Product"}</h2>

          <form onSubmit={handleSubmit}>
            <label>Barcode</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              placeholder="Enter barcode"
            />

            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
            />

            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
            />

            <label>VAT Percentage</label>
            <input
              type="number"
              name="vatPercentage"
              value={formData.vatPercentage}
              onChange={handleInputChange}
              placeholder="Enter VAT percentage"
            />

            <label>Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              placeholder="Enter stock quantity"
            />

            <div className="form-actions">
              <button type="submit">
                {editingProductId ? "Update Product" : "Create Product"}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="product-list-section">
          <h2>Products</h2>

          <div className="search-section">
            <input
              className="search-input"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name or barcode"
            />

            <button onClick={handleSearch}>Search</button>
            <button onClick={handleClearSearch}>Clear</button>
          </div>

          {loading && <p>Loading products...</p>}

          {!loading && products.length === 0 && <p>No products found.</p>}

          {!loading && products.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>VAT</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.barcode}</td>
                    <td>{product.name}</td>
                    <td>{product.price.toFixed(2)}</td>
                    <td>{product.vatPercentage}%</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product.id)}
                      >
                        Disable
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pagination-section">
            <button onClick={goToPreviousPage} disabled={pageNumber <= 1}>
              Previous
            </button>

            <span>
              Page {pageNumber} of {totalPages}
            </span>

            <button onClick={goToNextPage} disabled={pageNumber >= totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductManagementPage;