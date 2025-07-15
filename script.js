document.addEventListener("DOMContentLoaded", function () {
  const cart = [];
  const cartList = document.getElementById("cart");
  const totalDisplay = document.getElementById("total");

  document.querySelectorAll(".add-btn").forEach(button => {
    button.addEventListener("click", function () {
      const flavor = this.dataset.flavor;
      cart.push(flavor);
      renderCart();
    });
  });

  function renderCart() {
    cartList.innerHTML = "";
    cart.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = item;
      cartList.appendChild(li);
    });
    totalDisplay.textContent = cart.length * 10000 + " сум";
  }

  document.getElementById("checkout").addEventListener("click", () => {
    alert("Оформление заказа: " + cart.join(", "));
  });
});
