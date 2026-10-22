// Lab 4: save orders in localStorage and show them safely.
const STORAGE_KEY = "cafeOrders";
 
const form = document.querySelector("#order-form");
const tbody = document.querySelector("#orders-body");
const message = document.querySelector("#message");
const clearButton = document.querySelector("#clear-orders");
 
function isSavedOrder(order) {
  return order !== null
    && typeof order === "object"
    && typeof order.name === "string"
    && typeof order.phone === "string"
    && typeof order.item === "string"
    && typeof order.size === "string"
    && typeof order.qty === "number"
    && typeof order.pickup === "string"
    && Array.isArray(order.extras)
    && order.extras.every(function (extra) {
      return typeof extra === "string";
    })
    && typeof order.notes === "string";
}

function loadOrders() {
  const savedOrders = localStorage.getItem(STORAGE_KEY);
  if (savedOrders === null) {
    return [];
  }

  const orders = JSON.parse(savedOrders);
  if (!Array.isArray(orders) || !orders.every(isSavedOrder)) {
    throw new TypeError("Saved order data has an invalid format.");
  }
  return orders;
}
 
function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
 
// Add one table cell. textContent treats the text as plain text, never as HTML.
function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}
 
function render() {
  tbody.innerHTML = "";
  let orders;

  try {
    orders = loadOrders();
  } catch (error) {
    console.error("Could not load saved orders.", error);
    message.textContent = "Saved orders could not be loaded. Clear them to continue.";
    return;
  }
 
  if (orders.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No orders saved yet.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
 
  orders.forEach(function (order) {
    const row = document.createElement("tr");
    addCell(row, order.name);
    addCell(row, order.item + " (" + order.size + ")");
    addCell(row, String(order.qty));
    addCell(row, order.pickup);
    addCell(row, order.extras.length ? order.extras.join(", ") : "none");
    tbody.appendChild(row);
  });
}
 
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page reload
 
  const data = new FormData(form);
  const order = {
    name: data.get("name").trim(),
    phone: data.get("phone"),
    item: data.get("item"),
    size: data.get("size"),
    qty: Number(data.get("qty")),
    extras: data.getAll("extras"),
    pickup: data.get("pickup"),
    notes: data.get("notes").trim()
  };
 
  try {
    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);
  } catch (error) {
    console.error("Could not save the order.", error);
    message.textContent = "Could not save your order in this browser.";
    return;
  }
 
  form.reset();
  message.textContent = "Thank you, " + order.name + "! Your order has been saved.";
  render();
});
 
clearButton.addEventListener("click", function () {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not clear saved orders.", error);
    message.textContent = "Could not clear saved orders in this browser.";
    return;
  }
  message.textContent = "All saved orders were cleared.";
  render();
});
 
render();
