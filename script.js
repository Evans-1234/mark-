// ----------------------- Data -----------------------
const products = {
    "Wines": ["Red Wine", "White Wine", "Rose Wine", "Sparkling Wine", "Dessert Wine", "Table Wine", "Fruit Wine", "Ice Wine", "Dry Wine", "Organic Wine"],
    "Spirits": ["Gin", "Rum", "Brandy", "Absinthe", "Mezcal", "Pisco", "Cachaca", "Schnapps", "Soju", "Grappa"],
    "Tequila": ["Blanco", "Reposado", "Anejo", "Extra Anejo", "Cristalino", "Gold Tequila", "Silver Tequila", "Agave Tequila", "Mixto Tequila", "Reserva Tequila"],
    "Soft Drinks": ["Coca-Cola", "Pepsi", "Sprite", "Fanta", "Mountain Dew", "Ginger Ale", "Root Beer", "Tonic Water", "Club Soda", "Lemonade"],
    "Vodka": ["Classic Vodka", "Flavored Vodka", "Premium Vodka", "Wheat Vodka", "Potato Vodka", "Corn Vodka", "Grape Vodka", "Rye Vodka", "Organic Vodka", "Crystal Vodka"],
    "Brandy": ["Cognac", "Armagnac", "American Brandy", "Spanish Brandy", "Fruit Brandy", "Grape Brandy", "Aged Brandy", "Fine Brandy", "XO Brandy", "VSOP Brandy"],
    "Whiskey": ["Scotch Whisky", "Irish Whiskey", "Bourbon", "Rye Whiskey", "Japanese Whisky", "Single Malt", "Blended Whiskey", "Tennessee Whiskey", "Corn Whiskey", "Canadian Whisky"]
};

let stock = {};
let price = 250;
let ratings = {}; // Stores ratings
let logs = []; // Stores logs of purchases and stock additions

// Initialize stock and ratings
for (let category in products) {
    stock[category] = {};
    ratings[category] = {};
    products[category].forEach(drink => {
        stock[category][drink] = { quantity: 40, price: price };
        ratings[category][drink] = { totalStars: 0, totalRatings: 0 };
    });
}

// ----------------------- DOM Elements -----------------------
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

const categories = document.querySelectorAll('.category');
const productsSection = document.getElementById('products');
const productList = document.querySelector('.product-list');
const productTitle = document.getElementById('product-title');
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const adminPass = document.getElementById('adminPass');
const loginAdmin = document.getElementById('loginAdmin');
const adminPanel = document.getElementById('adminPanel');
const stockList = document.getElementById('stockList');
const backBtn = document.getElementById('backBtn');
const logoutAdmin = document.getElementById('logoutAdmin');
const updatesBtn = document.getElementById('updatesBtn'); // New button
const updatesSection = document.getElementById('updatesSection'); // New section for logs

// Hardcoded User Credentials (Replace with a database in a real app)
const users = [
    { username: "customer1", password: "pass123" },
    { username: "customer2", password: "pass456" }
];

// ----------------------- Event Listeners -----------------------

// Handle Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validate User
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Successful Login
        loginPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loginError.classList.add('hidden');
    } else {
        // Failed Login
        loginError.classList.remove('hidden');
    }
});

// Open Admin Login Modal
adminBtn.addEventListener('click', () => {
    adminModal.style.display = "block";
});

// Admin Login Validation
loginAdmin.addEventListener('click', () => {
    if (adminPass.value === "admin123") {
        adminModal.style.display = "none";
        adminPanel.style.display = "block";
        updateStockView();
    } else {
        alert("Wrong password! Access Denied.");
    }
});

// Handle Category Selection
categories.forEach(btn => {
    btn.addEventListener('click', () => {
        let category = btn.dataset.category;
        productTitle.innerText = category;
        productList.innerHTML = "";

        products[category].forEach(product => {
            const quantity = stock[category][product].quantity;
            const price = stock[category][product].price;
            productList.innerHTML += `
                <div class="product" data-category="${category}">
                    <p>${product} - <strong>Ksh ${price}</strong> (${quantity} left)</p>
                    <button onclick="buyDrink('${category}', '${product}')">Buy</button>
                    <div class="rating" id="rating-${category}-${product.replace(/\s+/g, '-')}">
                        ${[1, 2, 3, 4].map(star => `
                            <span class="star" onclick="rateDrink('${category}', '${product}', ${star})">&#9733;</span>
                        `).join('')}
                    </div>
                </div>`;
        });

        productsSection.classList.remove('hidden');
        document.getElementById('categories').classList.add('hidden');
    });
});

// Buy Drink Function
function buyDrink(category, drink) {
    if (stock[category][drink].quantity > 0) {
        stock[category][drink].quantity--;
        alert(`${drink} purchased! Please rate the product.`);
        updateStockView();
        updateProductDisplay(category);

        // Log the purchase
        logs.push({
            type: "Purchase",
            product: drink,
            category: category,
            date: new Date().toLocaleString()
        });
    } else {
        alert(`${drink} is out of stock!`);
    }
}

// Rate Drink Function
function rateDrink(category, drink, stars) {
    ratings[category][drink].totalStars += stars;
    ratings[category][drink].totalRatings++;
    alert(`You rated ${drink} with ${stars} stars!`);
    updateStockView();
}

// Update Stock View in Admin Panel
function updateStockView() {
    stockList.innerHTML = "<h3>Stock Levels</h3>";
    for (let category in stock) {
        stockList.innerHTML += `<h4>${category}</h4>`;
        for (let drink in stock[category]) {
            let avgRating = ratings[category][drink].totalRatings > 0 ?
                (ratings[category][drink].totalStars / ratings[category][drink].totalRatings).toFixed(1) : "No Ratings";
            stockList.innerHTML += `
                <p>${drink}: <strong>${stock[category][drink].quantity}</strong> left - Price: Ksh ${stock[category][drink].price} - Rating: ${avgRating}⭐
                    <input type="number" id="increase-${drink}" placeholder="Increase Stock">
                    <button onclick="increaseStock('${category}', '${drink}')">Increase</button>
                    <input type="number" id="price-${drink}" placeholder="New Price">
                    <button onclick="modifyPrice('${category}', '${drink}')">Update Price</button>
                </p>`;
        }
    }
}

// Increase Stock Function
function increaseStock(category, drink) {
    let increaseAmount = parseInt(document.getElementById(`increase-${drink}`).value);
    if (!isNaN(increaseAmount) && increaseAmount > 0) {
        stock[category][drink].quantity += increaseAmount;
        alert(`${increaseAmount} units added to ${drink}`);
        updateStockView();
        updateProductDisplay(category);

        // Log the stock addition
        logs.push({
            type: "Stock Added",
            product: drink,
            category: category,
            amount: increaseAmount,
            date: new Date().toLocaleString()
        });
    } else {
        alert("Enter a valid stock increase amount.");
    }
}

// Modify Price Function
function modifyPrice(category, drink) {
    let newPrice = parseFloat(document.getElementById(`price-${drink}`).value);
    if (!isNaN(newPrice) && newPrice > 0) {
        stock[category][drink].price = newPrice;
        alert(`Price for ${drink} updated to Ksh ${newPrice}`);
        updateStockView();
        updateProductDisplay(category);
    } else {
        alert("Enter a valid price.");
    }
}

// Update Product Display for Customers
function updateProductDisplay(category) {
    productList.innerHTML = ""; // Clear the current product list
    products[category].forEach(product => {
        const quantity = stock[category][product].quantity;
        const price = stock[category][product].price;
        productList.innerHTML += `
            <div class="product" data-category="${category}">
                <p>${product} - <strong>Ksh ${price}</strong> (${quantity} left)</p>
                <button onclick="buyDrink('${category}', '${product}')">Buy</button>
                <div class="rating" id="rating-${category}-${product.replace(/\s+/g, '-')}">
                    ${[1, 2, 3, 4].map(star => `
                        <span class="star" onclick="rateDrink('${category}', '${product}', ${star})">&#9733;</span>
                    `).join('')}
                </div>
            </div>`;
    });
}

// View Updates (Logs)
function viewUpdates() {
    updatesSection.innerHTML = "<h3>Updates Log</h3>";
    if (logs.length === 0) {
        updatesSection.innerHTML += "<p>No updates yet.</p>";
    } else {
        logs.forEach(log => {
            updatesSection.innerHTML += `
                <p><strong>${log.type}</strong> - ${log.product} (${log.category}) - ${log.amount ? `Amount: ${log.amount}, ` : ''}${log.date}</p>`;
        });
    }
}

// Admin Logout
logoutAdmin.addEventListener('click', () => {
    adminPanel.style.display = "none";
    adminModal.style.display = "none";
    adminPass.value = "";
});

// Back Button to Return to Categories
backBtn.addEventListener('click', () => {
    productsSection.classList.add('hidden');
    document.getElementById('categories').classList.remove('hidden');
});

// Updates Button
updatesBtn.addEventListener('click', () => {
    viewUpdates();
    updatesSection.style.display = "block";
});