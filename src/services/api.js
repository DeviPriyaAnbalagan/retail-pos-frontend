const API_BASE_URL = "https://localhost:7149/api";

export async function getProducts(){
    const response = await fetch(`${API_BASE_URL}/products`);

    if(!response.ok){
        throw new Error("Failed to fetch products");
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

