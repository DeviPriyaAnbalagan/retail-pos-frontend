import { useEffect, useState } from "react";
import { getProducts, createSale } from "../services/api";
import "../App.css";

function PosPage() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function addToCart(product) {
    setMessage("");
    setReceipt(null);

    const existingItem = cartItems.find((item) => item.productId === product.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          vatPercentage: product.vatPercentage,
          quantity: 1
        }
      ]);
    }
  }

  function increaseQuantity(productId) {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCartItems(
      cartItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId) {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  }

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const vatAmount = cartItems.reduce(
    (sum, item) =>
      sum + (item.price * item.quantity * item.vatPercentage) / 100,
    0
  );

  const totalAmount = subTotal + vatAmount;

  const filteredProducts = products.filter((product) => {
    const searchValue = searchText.toLowerCase();

  return (
    product.name.toLowerCase().includes(searchValue) ||
    product.barcode.toLowerCase().includes(searchValue)
  );
});

  async function handleCheckout() {
    try {
      setMessage("");
      setReceipt(null);

      if (cartItems.length === 0) {
        setMessage("Cart is empty.");
        return;
      }

      if (!amountPaid || Number(amountPaid) < totalAmount) {
        setMessage("Amount paid must be greater than or equal to total amount.");
        return;
      }

      const saleRequest = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        amountPaid: Number(amountPaid),
        transactionReference: `FRONTEND-${Date.now()}`
      };

      const saleResponse = await createSale(saleRequest);

      setReceipt(saleResponse);
      setCartItems([]);
      setAmountPaid("");
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page-container">
      <h1>Retail POS Checkout</h1>

      {message && <div className="error-message">{message}</div>}

      <div className="pos-layout">
        <div className="products-section">
          <h2>Products</h2>

          <div className="product-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <h3>{product.name}</h3>
                <p>Barcode: {product.barcode}</p>
                <p>Price: {product.price.toFixed(2)}</p>
                <p>VAT: {product.vatPercentage}%</p>
                <p>Stock: {product.stockQuantity}</p>
                <button onClick={() => addToCart(product)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Cart</h2>

          {cartItems.length === 0 ? (
            <p>No items added.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>
                      <button onClick={() => decreaseQuantity(item.productId)}>
                        -
                      </button>
                      <span className="qty">{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.productId)}>
                        +
                      </button>
                    </td>
                    <td>{item.price.toFixed(2)}</td>
                    <td>{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeItem(item.productId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="summary">
            <p>Subtotal: {subTotal.toFixed(2)}</p>
            <p>VAT: {vatAmount.toFixed(2)}</p>
            <h3>Total: {totalAmount.toFixed(2)}</h3>
          </div>

          <div className="payment-section">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>

            <label>Amount Paid</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Enter amount paid"
            />

            <button className="checkout-button" onClick={handleCheckout}>
              Complete Sale
            </button>
          </div>

          {receipt && (
            <div className="receipt-box">
              <h2>Sale Completed</h2>
              <p>Receipt: {receipt.receiptNumber}</p>
              <p>Total: {receipt.totalAmount.toFixed(2)}</p>
              <p>Payment: {receipt.paymentMethod}</p>
              <p>Amount Paid: {receipt.amountPaid.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PosPage;