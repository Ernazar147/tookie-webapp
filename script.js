// Список вкусов
const flavors = [
    "🍫 Классик Шоколад",
    "🍪 Орео-Мания",
    "🍓 Клубничный Джем",
    "🥜 Арахисовый Бум",
    "🍯 Медовый Нутелла",
    "🍋 Лимонный Тарт",
    "🍌 Банановый Шторм",
    "🥮 Красный Бархат"
];

// Функция для отображения вкусов с чекбоксами
function displayFlavors() {
    const flavorContainer = document.getElementById('flavors');
    flavorContainer.innerHTML = '';
    flavors.forEach(flavor => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = flavor;
        checkbox.id = flavor;
        const label = document.createElement('label');
        label.htmlFor = flavor;
        label.textContent = flavor;
        flavorContainer.appendChild(checkbox);
        flavorContainer.appendChild(label);
        flavorContainer.appendChild(document.createElement('br'));
    });
}

// Инициализация вкусов
displayFlavors();

// Обработчик кнопки "Оформить заказ"
document.getElementById('order-button').addEventListener('click', () => {
    const boxSize = document.getElementById('box-size').value;
    const selectedFlavors = Array.from(document.documentElement.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    
    // Проверка, выбраны ли вкусы
    if (selectedFlavors.length === 0) {
        alert('Выбери хотя бы один вкус, бро!');
        return;
    }
    
    // Собираем данные заказа
    const orderData = {
        box: parseInt(boxSize),
        flavors: selectedFlavors
    };
    
    // Отправляем данные в бота
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(orderData));
    } else {
        alert('Ошибка: Telegram WebApp не грузится. Проверь подключение к Telegram.');
    }
});