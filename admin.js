const $ = (selector) => document.querySelector(selector);
let client = null;
let sessionToken = null;
let transactionRows = [];
let toastTimer;

const paymentStatusLabels = {
  not_processed:"Not processed",
  pending:"Pending",
  processing:"Processing",
  succeeded:"Succeeded (manual)",
  failed:"Failed",
  refunded:"Refunded (manual)"
};

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
      <p class="admin-order-payment">Payment: ${escapeHtml(order.payment_method)} · ${escapeHtml(order.payment_transaction?.status ?? "not recorded; payment is not processed")}</p>
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

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

async function loadOverview() {
  const data = await api("/api/admin/overview");
  $("#overviewCustomers").textContent = data.summary.customers;
  $("#overviewOrders").textContent = data.summary.orders;
  $("#overviewOrderValue").textContent = money(data.summary.order_value_php);
  $("#overviewLowStock").textContent = data.summary.low_stock;
  $("#overviewCustomerRows").innerHTML = data.customers.length ? data.customers.map((customer) => `
    <tr>
      <td>${escapeHtml(customer.name)}</td>
      <td>${escapeHtml(customer.email)}</td>
      <td>${escapeHtml(customer.phone)}</td>
      <td>${escapeHtml(customer.delivery_address)}</td>
      <td>${formatDate(customer.joined)}</td>
    </tr>`).join("") : '<tr><td colspan="5">No customer accounts yet.</td></tr>';
  $("#overviewOrderRows").innerHTML = data.recentOrders.length ? data.recentOrders.map((order) => {
    const items = (order.items ?? []).map((item) => `${item.product_name} × ${item.quantity}`).join(", ");
    const delivery = [order.customer_phone,order.delivery_address].filter(Boolean).join(" · ");
    return `<tr>
      <td>${escapeHtml(order.tracking_number)}<span>${money(order.total_php)} · ${escapeHtml(formatDate(order.created_at))}</span></td>
      <td>${escapeHtml(order.customer_name)}<span>${escapeHtml(order.customer_email)}</span></td>
      <td>${escapeHtml(items || "No item detail")}</td>
      <td>${escapeHtml(delivery || "Not provided")}</td>
      <td>${escapeHtml(order.payment_method)}<span>${escapeHtml(order.payment_status)} · not charged</span></td>
      <td>${escapeHtml(order.coupon)}</td>
    </tr>`;
  }).join("") : '<tr><td colspan="6">No orders yet.</td></tr>';
  $("#overviewLowStockRows").innerHTML = data.lowStock.length ? data.lowStock.map((product) => `
    <tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.brand)}</td><td>${product.stock}</td></tr>`
  ).join("") : '<tr><td colspan="3">All active products have healthy stock.</td></tr>';
  $("#adminUpdated").textContent = `Live · updated ${new Date().toLocaleTimeString()}`;
}

async function loadFeedback() {
  const feedback = await api("/api/admin/feedback");
  $("#adminFeedback").innerHTML = feedback.length ? feedback.map((entry) => `
    <article class="feedback-card">
      <div><strong>${escapeHtml(entry.customer_name || entry.email || "Customer")}</strong><span>${escapeHtml(entry.email || "")} · ${formatDate(entry.created_at)}</span></div>
      <span class="feedback-rating" aria-label="${entry.rating} out of 5 stars">${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}</span>
      <p>${escapeHtml(entry.message)}</p>
    </article>`).join("") : "<p>No client feedback has been submitted yet.</p>";
}

function renderTransactions() {
    const selectedStatus = $("#transactionStatusFilter").value;
    const filtered = transactionRows.filter((transaction) =>
      selectedStatus === "all" || transaction.status === selectedStatus
    );
    $("#adminTransactions").innerHTML = filtered.length ? filtered.map((transaction) => `
      <tr>
        <td><strong>${escapeHtml(transaction.tracking_number)}</strong><span>${formatDate(transaction.created_at)}</span></td>
        <td>${escapeHtml(transaction.customer_name || "Customer")}<span>${escapeHtml(transaction.email || "")} · ${escapeHtml(transaction.customer_phone || "—")}</span></td>
        <td>${escapeHtml(transaction.delivery_address || "Not provided")}</td>
        <td>${money(transaction.amount_php)}</td>
        <td>${escapeHtml(transaction.payment_method)}</td>
        <td>${escapeHtml(paymentStatusLabels[transaction.status] ?? transaction.status)}</td>
        <td>${new Date(transaction.updated_at).toLocaleString()}</td>
        <td><form class="transaction-status-form" data-transaction-form data-transaction-id="${escapeHtml(transaction.id)}">
          <select name="status" aria-label="Status for ${escapeHtml(transaction.tracking_number)}">
            ${Object.entries(paymentStatusLabels).map(([value,label]) =>
              `<option value="${value}"${transaction.status === value ? " selected" : ""}>${escapeHtml(label)}</option>`
            ).join("")}
          </select>
          <button class="edit-product" type="submit">Save status</button>
        </form></td>
      </tr>      `).join("") : '<tr><td colspan="8">No transactions match this status.</td></tr>';
}

async function loadTransactions() {
    transactionRows = await api("/api/admin/transactions");
    renderTransactions();
}

function setTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("active",tab.dataset.adminTab === tabName));
  $("#overviewPanel").hidden = tabName !== "overview";
  $("#feedbackPanel").hidden = tabName !== "feedback";
  $("#transactionsPanel").hidden = tabName !== "transactions";
  $("#productsPanel").hidden = tabName !== "products";
  $("#ordersPanel").hidden = tabName !== "orders";
  $("#usersPanel").hidden = tabName !== "users";
}

async function enterDashboard() {
  await api("/api/admin/me");
  $("#adminLogin").hidden = true;
  $("#adminDashboard").hidden = false;
  await loadOverview();
  await loadFeedback();
  await loadTransactions();
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
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const message = $("#adminLoginMessage");
  message.textContent = "";
  if (!client) {
    message.textContent = "Supabase is not configured. Add your project URL and publishable/anon key to the local .env file, then restart the server.";
    return;
  }
  submitButton.disabled = true;
  try {
    const {data,error} = await client.auth.signInWithPassword({
      email:$("#adminEmail").value.trim(),
      password:$("#adminPassword").value
    });
    if (error) throw error;
    if (!data.session?.access_token) throw new Error("Supabase did not return a signed-in session.");
    sessionToken = data.session.access_token;
    await enterDashboard();
  } catch (accessError) {
    if (sessionToken) {
      const {error:signOutError} = await client.auth.signOut();
      if (signOutError) message.textContent = `${accessError.message} Sign-out also failed: ${signOutError.message}`;
    }
    sessionToken = null;
    if (!message.textContent) message.textContent = accessError.message;
  } finally {
    submitButton.disabled = false;
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

$("#userRoleForm").addEventListener("submit",async (event) => {
  event.preventDefault();
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  const message = $("#userRoleMessage");
  message.textContent = "";
  submitButton.disabled = true;
  try {
    const result = await api("/api/admin/users/role",{
      method:"POST",
      body:JSON.stringify({email:$("#roleEmail").value.trim(),role:$("#roleValue").value})
    });
    message.textContent = `${result.email} now has ${result.role} access.`;
    event.currentTarget.reset();
    $("#roleValue").value = "admin";
  } catch (error) {
    message.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

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

$("#adminTransactions").addEventListener("submit",async (event) => {
  const form = event.target.closest("[data-transaction-form]");
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const data = new FormData(form);
    await api(`/api/admin/transactions/${encodeURIComponent(form.dataset.transactionId)}/status`,{
      method:"PATCH",
      body:JSON.stringify({status:data.get("status")})
    });
    await loadTransactions();
    toast("Transaction status saved. It is not verified by a payment provider.");
  } catch (error) {
    showMessage(error.message);
  } finally {
    button.disabled = false;
  }
});

$("#transactionStatusFilter").addEventListener("change",renderTransactions);
$("#refreshOrders").addEventListener("click",() => loadOrders().catch((error) => showMessage(error.message)));
$("#refreshOverview").addEventListener("click",() => loadOverview().catch((error) => showMessage(error.message)));
$("#refreshFeedback").addEventListener("click",() => loadFeedback().catch((error) => showMessage(error.message)));
$("#refreshTransactions").addEventListener("click",() => loadTransactions().catch((error) => showMessage(error.message)));

initialize();
