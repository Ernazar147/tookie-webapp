const flavors = [
    { name: "Классик Шоколад", emoji: "🍫" },
    { name: "Орео-Мания", emoji: "🍪" },
    { name: "Клубничный Джем", emoji: "🍓" },
    { name: "Медовый Нутелла", emoji: "🍯" },
    { name: "Банановый Шторм", emoji: "🍌" },
    { name: "Лимонный Тарт", emoji: "🍋" },
    { name: "Арахисовый Бум", emoji: "🥜" },
    { name: "Красный Бархат", emoji: "🥮" }
];

const boxPrices = { 1: 12000, 3: 35000, 4: 42000, 6: 65000 };
const promocodes = { "WELCOME10": 10, "COOKIE20": 20 };

let cart = [];
let appliedPromocode = null;

function init() {
    renderProducts();
    renderCart();
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    flavors.forEach(flavor => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h3>${flavor.emoji} ${flavor.name}</h3>
            <div class="quantity-control">
                <button onclick="updateQuantity('${flavor.name}', -1)">-</button>
                <span id="quantity-${flavor.name}">0</span>
                <button onclick="updateQuantity('${flavor.name}', 1)">+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart('${flavor.name}')">Добавить в корзину</button>
        `;
        productList.appendChild(card);
    });
}

function updateQuantity(flavorName, change) {
    const quantitySpan = document.getElementById(`quantity-${flavorName}`);
    let quantity = parseInt(quantitySpan.textContent) + change;
    if (quantity < 0) quantity = 0;
    quantitySpan.textContent = quantity;
}

function addToCart(flavorName) {
    const quantity = parseInt(document.getElementById(`quantity-${flavorName}`).textContent);
    if (quantity === 0) return;

    const existingItem = cart.find(item => item.flavor === flavorName);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ flavor: flavorName, quantity });
    }

    document.getElementById(`quantity-${flavorName}`).textContent = "0";
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const submitButton = document.getElementById("submit-order");
    cartItems.innerHTML = "";

    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = calculateTotalPrice(totalQuantity);
    if (appliedPromocode && promocodes[appliedPromocode]) {
        totalPrice *= (1 - promocodes[appliedPromocode] / 100);
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <p>${item.flavor} (${item.quantity} шт)</p>
            <button class="remove-item" onclick="removeFromCart(${index})">✖</button>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `${totalPrice.toLocaleString()} сум`;
    submitButton.disabled = cart.length === 0;
}

function calculateTotalPrice(quantity) {
    if (quantity === 0) return 0;
    if (quantity === 1) return boxPrices[1];
    if (quantity <= 3) return boxPrices[3];
    if (quantity <= 4) return boxPrices[4];
    return boxPrices[6];
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function applyPromocode() {
    const promocodeInput = document.getElementById("promocode").value.trim().toUpperCase();
    const status = document.getElementById("promocode-status");

    if (promocodeInput in promocodes) {
        appliedPromocode = promocodeInput;
        status.textContent = `Промокод ${promocodeInput} применён (-${promocodes[promocodeInput]}%)`;
        status.style.color = "#28a745";
    } else {
        appliedPromocode = null;
        status.textContent = "Неверный промокод";
        status.style.color = "#dc3545";
    }
    renderCart();
}

function submitOrder() {
    if (cart.length === 0) return;

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = calculateTotalPrice(totalQuantity);
    if (appliedPromocode && promocodes[appliedPromocode]) {
        totalPrice *= (1 - promocodes[appliedPromocode] / 100);
    }

    const orderData = {
        items: cart,
        total: Math.round(totalPrice),
        promocode: appliedPromocode || null
    };

    Telegram.WebApp.sendData(JSON.stringify(orderData));
}

document.addEventListener("DOMContentLoaded", init);