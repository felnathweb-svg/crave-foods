const WHATSAPP_NUMBER = "15551234567";
const DELIVERY_FEE = 3.5;

const menuItems = [
  {
    id: "burger",
    name: "Signature Smash Burger",
    price: 11.99,
    description: "Double smashed patty, cheddar, pickles, house sauce, and toasted brioche.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pizza",
    name: "Fire Roasted Margherita",
    price: 13.49,
    description: "San Marzano tomato, mozzarella, basil, olive oil, and crisp sourdough crust.",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bowl",
    name: "Golden Chicken Rice Bowl",
    price: 12.75,
    description: "Grilled chicken, saffron rice, cucumber salad, herbs, and garlic yogurt.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tacos",
    name: "Street Corn Tacos",
    price: 9.95,
    description: "Charred corn, avocado crema, cotija, cilantro, and lime in warm tortillas.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pasta",
    name: "Creamy Tomato Rigatoni",
    price: 14.25,
    description: "Rigatoni tossed with roasted tomato cream, parmesan, chili, and basil.",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fries",
    name: "Loaded Truffle Fries",
    price: 7.5,
    description: "Crispy fries, parmesan, chives, truffle aioli, and cracked pepper.",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
  },
];

const cart = new Map();
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const menuGrid = document.querySelector("#menuGrid");
const cartItems = document.querySelector("#cartItems");
const subtotalEl = document.querySelector("#subtotal");
const deliveryEl = document.querySelector("#delivery");
const totalEl = document.querySelector("#total");
const checkoutButton = document.querySelector("#checkoutButton");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function renderMenu() {
  menuGrid.innerHTML = menuItems
    .map(
      (item) => `
        <article class="menu-card">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="menu-body">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="menu-footer">
              <span class="price">${money.format(item.price)}</span>
              <button class="add-button" type="button" data-add="${item.id}">Add to Cart</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function getCartLines() {
  return Array.from(cart.entries()).map(([id, quantity]) => {
    const item = menuItems.find((menuItem) => menuItem.id === id);
    return { ...item, quantity, lineTotal: item.price * quantity };
  });
}

function renderCart() {
  const lines = getCartLines();
  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  if (lines.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Add something delicious from the menu.</p>';
  } else {
    cartItems.innerHTML = lines
      .map(
        (item) => `
          <article class="cart-item">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <div>
              <h3>${item.name}</h3>
              <p>${money.format(item.price)} each • ${money.format(item.lineTotal)}</p>
            </div>
            <div class="cart-actions">
              <button class="quantity-button" type="button" aria-label="Decrease ${item.name}" data-decrease="${item.id}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-button" type="button" aria-label="Increase ${item.name}" data-increase="${item.id}">+</button>
              <button class="remove-button" type="button" data-remove="${item.id}">Remove</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  subtotalEl.textContent = money.format(subtotal);
  deliveryEl.textContent = money.format(delivery);
  totalEl.textContent = money.format(total);
  checkoutButton.disabled = lines.length === 0;
}

function addItem(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
}

function decreaseItem(id) {
  const quantity = cart.get(id);
  if (!quantity) return;

  if (quantity === 1) {
    cart.delete(id);
  } else {
    cart.set(id, quantity - 1);
  }

  renderCart();
}

function removeItem(id) {
  cart.delete(id);
  renderCart();
}

function checkoutOnWhatsApp() {
  const lines = getCartLines();
  if (lines.length === 0) return;

  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + DELIVERY_FEE;
  const orderSummary = [
    "Hello Crave Street Kitchen! I would like to place this order:",
    "",
    ...lines.map((item) => `${item.quantity} x ${item.name} - ${money.format(item.lineTotal)}`),
    "",
    `Subtotal: ${money.format(subtotal)}`,
    `Delivery: ${money.format(DELIVERY_FEE)}`,
    `Total: ${money.format(total)}`,
  ].join("\n");

  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderSummary)}`;
}

document.addEventListener("click", (event) => {
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const increaseId = event.target.closest("[data-increase]")?.dataset.increase;
  const decreaseId = event.target.closest("[data-decrease]")?.dataset.decrease;
  const removeId = event.target.closest("[data-remove]")?.dataset.remove;

  if (addId) addItem(addId);
  if (increaseId) addItem(increaseId);
  if (decreaseId) decreaseItem(decreaseId);
  if (removeId) removeItem(removeId);
});

checkoutButton.addEventListener("click", checkoutOnWhatsApp);

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
});

renderMenu();
renderCart();
