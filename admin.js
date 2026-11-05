const $ = (selector) => document.querySelector(selector);
let client = null;
let sessionToken = null;
let toastTimer;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,(character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[character]);
}

function money(amount) {
  return new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(amount);
}

function showMessage(message) {
  $("#adminMessage").textContent = message;
}

function toast(message) {
  const element = $("#adminToast");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"),3000);
}

async function api(path,options = {}) {
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type","application/json");
  if (sessionToken) headers.set("Authorization",`Bearer ${sessionToken}`);
  const response = await fetch(path,{...options,headers});
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

async function loadProducts() {
  const rows = await api("/api/admin/products");
  $("#adminProducts").innerHTML = rows.map((product) => `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.id)}</span></td>
      <td>${escapeHtml(product.brand)}</td>
      <td>${escapeHtml(product.category)}</td>
      <td>${money(product.price_php)}</td>
      <td>${product.stock}</td>
      <td class="admin-state">${product.active ? "Visible" : "Hidden"}</td>
      <td><button class="edit-product" type="button" data-edit="${escapeHtml(product.id)}">Edit</button></td>
    </tr>`).join("");
}

function productPayload() {
  return {
    name:$("#productName").value.trim(),
    brand:$("#productBrand").value,
    category:$("#productCategory").value,
    price_php:Number($("#productPrice").value),
    stock:Number($("#productStock").value),
    image_url:$("#productImage").value.trim(),
    active:$("#productActive").checked
  };
}

function resetProductForm() {
  $("#productForm").reset();
  $("#productId").value = "";
  $("#productIdInput").disabled = false;
  $("#productActive").checked = true;
  $("#productFormTitle").textContent = "Add product";
  $("#productForm").hidden = true;
}

async function loadOrders() {
  const orders = await api("/api/admin/orders");
  $("#adminOrders").innerHTML = orders.length ? orders.map((order) => {
    const itemSummary = (order.order_items ?? []).map((item) =>
      `${escapeHtml(item.product_name)} × ${item.quantity}${Object.keys(item.configuration ?? {}).length ? ` · ${escapeHtml(JSON.stringify(item.configuration))}` : ""}`
    ).join("<br>");
    const latestEvent = order.tracking_events?.[0];
    return `<article class="admin-order-card" data-order="${escapeHtml(order.id)}">
      <div class="admin-order-head">
        <div><h3>${escapeHtml(order.tracking_number)} · ${money(order.total_php)}</h3><p>${escapeHtml(order.origin)} · ${new Date(order.created_at).toLocaleString()}</p></div>
        <span class="admin-order-status">${escapeHtml(order.status)}</span>
      </div>
      <p class="admin-order-items">${itemSummary || "No item detail available."}${latestEvent ? `<br>Latest: ${escapeHtml(latestEvent.description)} · ${escapeHtml(latestEvent.location)}` : ""}</p>
      <form class="tracking-update-form" data-tracking-form>
        <select name="status" aria-label="Shipment status"><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="in_transit">In transit</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>
        <input name="location" value="Pinamaloy, Don Carlos, Bukidnon" aria-label="Shipment location" required>
        <input name="description" placeholder="Shipment update note" aria-label="Shipment update note" required>
        <button class="button button-dark" type="submit">Add update <span>→</span></button>
      </form>
    </article>`;
  }).join("") : "<p>No orders yet.</p>";
}

function setTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("active",tab.dataset.adminTab === tabName));
  $("#productsPanel").hidden = tabName !== "products";
  $("#ordersPanel").hidden = tabName !== "orders";
}

async function enterDashboard() {
  await api("/api/admin/me");
  $("#adminLogin").hidden = true;
  $("#adminDashboard").hidden = false;
  await loadProducts();
  await loadOrders();
}

async function initialize() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("The shop server is not running. Start it with npm start.");
    const config = await response.json();
    if (!window.supabase?.createClient || !config.supabaseUrl || !config.anonKey) {
      throw new Error("Supabase browser configuration is missing.");
    }
    client = window.supabase.createClient(config.supabaseUrl,config.anonKey);
    const {data,error} = await client.auth.getSession();
    if (error) throw error;
    sessionToken = data.session?.access_token ?? null;
    if (sessionToken) await enterDashboard();
  } catch (error) {
    $("#adminLoginMessage").textContent = error.message;
  }
}

$("#adminLoginForm").addEventListener("submit",async (event) => {
  event.preventDefault();
  $("#adminLoginMessage").textContent = "";
  if (!client) {
    $("#adminLoginMessage").textContent = "Supabase is not configured. Start the server and verify .env.";
    return;
  }
  const {data,error} = await client.auth.signInWithPassword({
    email:$("#adminEmail").value.trim(),
    password:$("#adminPassword").value
  });
  if (error) {
    $("#adminLoginMessage").textContent = error.message;
    return;
  }
  sessionToken = data.session.access_token;
  try {
    await enterDashboard();
  } catch (accessError) {
    await client.auth.signOut();
    sessionToken = null;
    $("#adminLoginMessage").textContent = accessError.message;
  }
});

$("#adminSignOut").addEventListener("click",async () => {
  const {error} = await client.auth.signOut();
  if (error) return toast(`Sign out failed: ${error.message}`);
  sessionToken = null;
  $("#adminDashboard").hidden = true;
  $("#adminLogin").hidden = false;
  toast("Signed out.");
});

document.querySelectorAll(".admin-tab").forEach((tab) =>
  tab.addEventListener("click",() => setTab(tab.dataset.adminTab))
);

$("#newProductButton").addEventListener("click",() => {
  resetProductForm();
  $("#productForm").hidden = false;
  $("#productForm").scrollIntoView({behavior:"smooth",block:"center"});
});

$("#cancelProduct").addEventListener("click",resetProductForm);

$("#adminProducts").addEventListener("click",(event) => {
  const button = event.target.closest("[data-edit]");
  if (!button) return;
  api("/api/admin/products").then((products) => {
    const product = products.find((item) => item.id === button.dataset.edit);
    if (!product) throw new Error("Product no longer exists.");
    $("#productId").value = product.id;
    $("#productIdInput").value = product.id;
    $("#productIdInput").disabled = true;
    $("#productName").value = product.name;
    $("#productBrand").value = product.brand;
    $("#productCategory").value = product.category;
    $("#productPrice").value = product.price_php;
    $("#productStock").value = product.stock;
    $("#productImage").value = product.image_url;
    $("#productActive").checked = product.active;
    $("#productFormTitle").textContent = `Edit ${product.name}`;
    $("#productForm").hidden = false;
    $("#productForm").scrollIntoView({behavior:"smooth",block:"center"});
  }).catch((error) => showMessage(error.message));
});

$("#productForm").addEventListener("submit",async (event) => {
  event.preventDefault();
  const id = $("#productId").value || $("#productIdInput").value.trim();
  const method = $("#productId").value ? "PATCH" : "POST";
  const route = method === "PATCH" ? `/api/admin/products/${encodeURIComponent(id)}` : "/api/admin/products";
  try {
    await api(route,{method,body:JSON.stringify({id,...productPayload()})});
    resetProductForm();
    await loadProducts();
    showMessage("Product saved.");
  } catch (error) {
    showMessage(error.message);
  }
});

$("#adminOrders").addEventListener("submit",async (event) => {
  const form = event.target.closest("[data-tracking-form]");
  if (!form) return;
  event.preventDefault();
  const orderId = form.closest("[data-order]").dataset.order;
  const data = new FormData(form);
  try {
    await api(`/api/admin/orders/${encodeURIComponent(orderId)}/tracking`,{
      method:"POST",
      body:JSON.stringify({
        status:data.get("status"),
        location:data.get("location"),
        description:data.get("description")
      })
    });
    await loadOrders();
    toast("Shipment update saved.");
  } catch (error) {
    showMessage(error.message);
  }
});

$("#refreshOrders").addEventListener("click",() => loadOrders().catch((error) => showMessage(error.message)));

initialize();
