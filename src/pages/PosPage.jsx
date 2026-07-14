import { useEffect, useState } from "react";
import { searchProducts, getProductsByBarcode, createSale } from "../services/api";
import "../App.css";

function PosPage() {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Card");
    const [amountPaid, setAmountPaid] = useState("");
    const [message, setMessage] = useState("");
    const [receipt, setReceipt] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [barCodeInput, setBarCodeInput] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

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

    function addToCart(product) {
        setMessage("");
        setReceipt(null);

        if (product.stockQuantity <= 0) {
            setMessage(`${product.name} is out of stock.`);
            return;
        }

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
                    stockQuantity: product.stockQuantity,
                    quantity: 1
                }
            ]);
        }
    }

    function increaseQuantity(productId) {
        setMessage("");

        const cartItem = cartItems.find((item) => item.productId === productId);
        if (!cartItem) {
            return;
        }
        if (cartItem.quantity >= cartItem.stockQuantity) {
            setMessage(`Only ${cartItem.stockQuantity} units available for ${cartItem.name}.`);
            return;
        }
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

    async function handleBarCodeScan(event) {

        if (event.key !== "Enter") {
            return;
        }

        const barcode = barCodeInput.trim();

        if (!barcode) {
            setMessage("Please enter or scan a barcode.");
            return;
        }

        try {
            setMessage("");
            setReceipt(null);

            const product = await getProductsByBarcode(barcode);

            if (product.stockQuantity <= 0) {
                setMessage("Product is out of stock.");
                return;
            }

            addToCart(product);
            setBarCodeInput("");
        }
        catch (error) {
            setMessage("Product not found for this barcode.");
        }

    }

    function validateCheckout() {
        if (cartItems.length === 0) {
            setMessage("Cart is empty.");
            return false;
        }

        const invalidStockItem = cartItems.find(
            (item) => item.quantity > item.stockQuantity
        );

        if (invalidStockItem) {
            setMessage(
                `Only ${invalidStockItem.stockQuantity} units available for ${invalidStockItem.name}.`
            );
            return false;
        }

        if (!amountPaid || Number(amountPaid) < totalAmount) {
            setMessage("Amount paid must be greater than or equal to total amount.");
            return false;
        }

        return true;
    }

    function handleConfirmCheckoutClick() {
        setMessage("");

        const isValid = validateCheckout();

        if (!isValid) {
            return;
        }

        setShowConfirm(true);
    }

    async function handleCheckout() {
        try {
            setMessage("");
            setReceipt(null);

            
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
            await loadProducts(searchText, pageNumber);
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
                    <div className="search-section">
                        <input
                            className="search-input"
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search by product name or barcode"
                        />
                        <button onClick={handleSearch}>Search</button>
                        <button onClick={handleClearSearch}>Clear</button>
                    </div>
                    <div className="product-grid">
                        {loading && <p>Loading products...</p>}
                        {!loading && products.length === 0 && <p>No products found.</p>}
                        {!loading && products.map((product) => (
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
                <div className="barcode-section">
                    <h2>BarCode Scan</h2>
                    <input
                        className="barcode-input"
                        type="text"
                        value={barCodeInput}
                        onChange={(e) => setBarCodeInput(e.target.value)}
                        onKeyDown={handleBarCodeScan}
                        placeholder="Scan or type barcode and press Enter"
                        autoFocus />
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
                                    <th>Available</th>
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
                                        <td>{item.stockQuantity}</td>
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

                        <button className="checkout-button" onClick={handleConfirmCheckoutClick}>
                            Complete Sale
                        </button>
                    </div>
                    {showConfirm && !receipt && (
                        <div className="confirmation-box">
                            <h2>Confirm Checkout</h2>

                            <p>Total items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                            <p>Subtotal: {subTotal.toFixed(2)}</p>
                            <p>VAT: {vatAmount.toFixed(2)}</p>
                            <h3>Total: {totalAmount.toFixed(2)}</h3>
                            <p>Payment Method: {paymentMethod}</p>
                            <p>Amount Paid: {Number(amountPaid).toFixed(2)}</p>
                            <p>Change: {(Number(amountPaid) - totalAmount).toFixed(2)}</p>

                            <div className="confirmation-actions">
                                <button onClick={handleCheckout}>Confirm Sale</button>
                                <button className="cancel-button" onClick={() => setShowConfirm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {receipt && (
                        <div className="receipt-box">
                            <h2>Sale Completed</h2>

                            <p><strong>Receipt No:</strong> {receipt.receiptNumber}</p>
                            <p><strong>Date:</strong> {new Date(receipt.saleDate).toLocaleString()}</p>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.productName}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.unitPrice.toFixed(2)}</td>
                                            <td>{item.lineTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="receipt-summary">
                                <p><strong>Subtotal:</strong> {receipt.subTotal.toFixed(2)}</p>
                                <p><strong>VAT:</strong> {receipt.vatAmount.toFixed(2)}</p>
                                <h3>Total: {receipt.totalAmount.toFixed(2)}</h3>
                                <p><strong>Payment:</strong> {receipt.paymentMethod}</p>
                                <p><strong>Amount Paid:</strong> {receipt.amountPaid.toFixed(2)}</p>
                                <p>
                                    <strong>Change:</strong>{" "}
                                    {(receipt.amountPaid - receipt.totalAmount).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PosPage;