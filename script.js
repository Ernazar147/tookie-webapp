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
let selectedBox = null;
let remainingCookies = 0;

function init() {
    renderBoxSelection();
    renderProducts();
    renderCart();
}

function renderBoxSelection() {
    const boxOptions = document.getElementById("box-options");
    boxOptions.innerHTML = "";
    [1, 3, 4, 6].forEach(size => {
        const button = document.createElement("button");
        button.textContent = `${size} шт (${boxPrices[size].toLocaleString()} сум)`;
        button.onclick = () => selectBox(size);
        if (size === selectedBox) button.classList.add("selected");
        boxOptions.appendChild(button);
    });
}

function selectBox(size) {
    selectedBox = size;
    remainingCookies = size;
    cart = [];
    appliedPromocode = null;
    document.getElementById("products").style.display = "block";
    document.getElementById("promocode").value = "";
    document.getElementById("promocode-status").textContent = "";
    renderBoxSelection();
    renderProducts();
    renderCart();
    updateRemainingCookies();
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    if (!selectedBox) {
        productList.innerHTML = "<p>Сначала выберите коробку.</p>";
        return;
    }
    flavors.forEach(flavor => {
        const card = document.createElement("div");
        card.className = "product-card";
        const currentQuantity = cart.find(item => item.flavor === flavor.name)?.quantity || 0;
        card.innerHTML = `
            <h3>${flavor.emoji} ${flavor.name}</h3>
            <div class="quantity-control">
                <button onclick="updateQuantity('${flavor.name}', -1)" ${remainingCookies === 0 && currentQuantity === 0 ? 'disabled' : ''}>-</button>
                <span id="quantity-${flavor.name}">${currentQuantity}</span>
                <button onclick="updateQuantity('${flavor.name}', 1)" ${remainingCookies === 0 ? 'disabled' : ''}>+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart('${flavor.name}')" ${currentQuantity === 0 ? 'disabled' : ''}>Добавить в корзину</button>
        `;
        productList.appendChild(card);
    });
}

function updateQuantity(flavorName, change) {
    const currentQuantity = cart.find(item => item.flavor === flavorName)?.quantity || 0;
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0 || (remainingCookies - change < 0 && change > 0)) return;
    if (newQuantity === 0) {
        cart = cart.filter(item => item.flavor !== flavorName);
    } else {
        const item = cart.find(item => item.flavor === flavorName);
        if (item) {
            item.quantity = newQuantity;
        } else {
            cart.push({ flavor: flavorName, quantity: newQuantity });
        }
    }
    remainingCookies = selectedBox - cart.reduce((sum, item) => sum + item.quantity, 0);
    updateRemainingCookies();
    renderProducts();
    renderCart();
}

function addToCart(flavorName) {
    const currentQuantity = cart.find(item => item.flavor === flavorName)?.quantity || 0;
    if (currentQuantity === 0) return;
    remainingCookies = selectedBox - cart.reduce((sum, item) => sum + item.quantity, 0);
    updateRemainingCookies();
    renderProducts();
    renderCart();
}

function updateRemainingCookies() {
    const remainingSpan = document.getElementById("remaining-cookies");
    remainingSpan.textContent = remainingCookies;
    if (remainingCookies < 0) {
        remainingSpan.style.color = "#dc3545";
    } else {
        remainingSpan.style.color = "#333";
    }
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const submitButton = document.getElementById("submit-order");
    cartItems.innerHTML = "";

    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    let totalPrice = selectedBox ? boxPrices[selectedBox] : 0;
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
    submitButton.disabled = !selectedBox || totalQuantity !== selectedBox;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    remainingCookies = selectedBox - cart.reduce((sum, item) => sum + item.quantity, 0);
    updateRemainingCookies();
    renderProducts();
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
    if (!selectedBox || cart.reduce((sum, item) => sum + item.quantity, 0) !== selectedBox) return;

    let totalPrice = boxPrices[selectedBox];
    if (appliedPromocode && promocodes[appliedPromocode]) {
        totalPrice *= (1 - promocodes[appliedPromocode] / 100);
    }

    const orderData = {
        box: selectedBox,
        items: cart,
        total: Math.round(totalPrice),
        promocode: appliedPromocode || null
    };

    Telegram.WebApp.sendData(JSON.stringify(orderData));
}

document.addEventListener("DOMContentLoaded", init);