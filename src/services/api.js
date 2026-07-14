const API_BASE_URL = "https://localhost:7149/api";

export async function getProducts(){
    const response = await fetch(`${API_BASE_URL}/products`);

    if(!response.ok){
        throw new Error("Failed to fetch products");
    }

    return await response.json();
}

export async function searchProducts(searchText = "", pageNumber = 1, pageSize = 10) {
  const queryParams = new URLSearchParams({
    searchText: searchText,
    pageNumber: pageNumber,
    pageSize: pageSize
  });

  const response = await fetch(`${API_BASE_URL}/products/search?${queryParams}`);

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return await response.json();
}

export async function getProductsByBarcode(barcode) {

    const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`);

    if(!response.ok){
        throw new Error("Product not found");
        
    }
    
    return await response.json();
}

export async function createSale(saleRequest) {

    const response = await fetch(`${API_BASE_URL}/sales`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(saleRequest)
    });
    
    if(!response.ok){
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to create sale");
    }

    return await response.json();
}

export async function createProduct(productRequest) {
    
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(productRequest)
    })

     if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to create product");
  }

    return await response.json();
}

export async function updateProduct(id, productRequest) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(productRequest)
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to update product");
  }

  return await response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to delete product");
  }
}

export async function getDailySalesReport(date) {
  const queryParams = new URLSearchParams({
    date: date
  });

  const response = await fetch(`${API_BASE_URL}/reports/daily-sales?${queryParams}`);

  if (!response.ok) {
    throw new Error("Failed to fetch daily sales report");
  }

  return await response.json();
}

export async function getLowStockProducts(threshold = 5) {
  const queryParams = new URLSearchParams({
    threshold: threshold
  });

  const response = await fetch(`${API_BASE_URL}/reports/low-stock?${queryParams}`);

  if (!response.ok) {
    throw new Error("Failed to fetch low stock products");
  }

  return await response.json();
}
