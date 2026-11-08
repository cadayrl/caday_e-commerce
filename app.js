let products = window.CADAY_CATALOG;
const seedProducts = products;
const BRANDS = window.CADAY_BRANDS.map((brand) => brand.name);

const STORAGE_KEY = "caday-demo-store-v1";
let store = loadStore();
let cart = store.cart;
let activeCategory = "All";
let activeBrand = "All";
let authMode = "login";
let activeCheckoutSnapshot = null;
let supabaseClient = null;
let supabaseConfigured = false;
let currentUser = null;
let clientProfile = null;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const productGrid = $("#productGrid");
const overlay = $("#overlay");
const cartDrawer = $("#cartDrawer");
const authModal = $("#authModal");
const profileModal = $("#profileModal");
const checkoutModal = $("#checkoutModal");

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    showToast("Browser storage is unavailable. Changes may not persist.");
    return fallback;
  }
}

function loadStore() {
  const saved = readStorage(STORAGE_KEY, {cart:[],orders:[],stock:{}});
  const stock = Object.fromEntries(products.map((product) => {
    const savedStock = saved?.stock?.[product.id];
    return [product.id,Number.isInteger(savedStock) && savedStock >= 0 ? savedStock : product.stock];
  }));
  const savedCart = Array.isArray(saved?.cart) ? saved.cart : [];
  const savedOrders = Array.isArray(saved?.orders) ? saved.orders : [];
  const validCart = savedCart.filter((line) => {
    const product = products.find((item) => item.id === line.id);
    return product && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= stock[line.id];
  }).map((line) => ({
    id:line.id,
    quantity:line.quantity,
    configuration:line.configuration && typeof line.configuration === "object" ? line.configuration : null
  }));
  return {cart:validCart,orders:savedOrders,stock};
}

function persistCart(nextCart) {
  try {
    const nextStore = {...store,cart:nextCart};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
    store = nextStore;
    cart = nextCart;
    return true;
  } catch {
    showToast("Could not save your bag. Check available browser storage.");
    return false;
  }
}

function availableStock(product) {
  const stock = store.stock[product.id] ?? product.stock;
  const held = cart.filter((line) => line.id === product.id).reduce((sum,line) => sum + line.quantity,0);
  return Math.max(stock - held,0);
}

function money(amount) {
  return new Intl.NumberFormat("en-PH", {style:"currency",currency:"PHP"}).format(amount);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,(character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[character]);
}

function brandLogo(brand) {
  const slug = {"Li-Ning":"li-ning"}[brand] ?? brand.toLowerCase();
  return `assets/brands/${slug}.svg`;
}

function renderProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const visible = products.filter((product) => {
    const categoryMatches = activeCategory === "All" || product.category === activeCategory;
    const brandMatches = activeBrand === "All" || product.brand === activeBrand;
    const textMatches = `${product.name} ${product.category} ${product.brand}`.toLowerCase().includes(query);
    return categoryMatches && brandMatches && textMatches;
  });
  $("#emptyState").hidden = visible.length > 0;
  $("#resultsCount").textContent = `${visible.length} ${visible.length === 1 ? "product" : "products"}`;
  productGrid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image${product.photoCredit ? " has-photo" : ""}" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt ?? product.name)}" ${product.photoCredit ? `data-fallback="${escapeHtml(product.fallbackImage)}" data-fallback-alt="${escapeHtml(product.name)}"` : ""} loading="lazy">
        ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
        <span class="product-brand-mark"><img src="${brandLogo(product.brand)}" alt="${escapeHtml(product.brand)}"></span>
        ${product.photoCredit ? `<a class="photo-credit" href="${escapeHtml(product.photoPage)}" target="_blank" rel="noopener noreferrer" aria-label="Image source: ${escapeHtml(product.photoCredit)}">PHOTO REF · ${escapeHtml(product.photoCredit)}</a>` : ""}
        ${product.category === "Rackets"
          ? `<button class="quick-add customize-add" data-customize="${escapeHtml(product.id)}" aria-label="Customize ${escapeHtml(product.name)}">SET UP</button>`
          : `<button class="quick-add" data-add="${escapeHtml(product.id)}" aria-label="Add ${escapeHtml(product.name)} to bag" ${availableStock(product) === 0 ? "disabled" : ""}>+</button>`}
      </div>
      <div class="product-info"><div><h3 class="product-name">${escapeHtml(product.name)}</h3><p class="product-category">${escapeHtml(product.brand)} · ${escapeHtml(product.category)} · <span class="stock-count">${store.stock[product.id] ?? product.stock} in stock</span></p><div class="swatches">${product.colors.map((color) => `<span class="swatch" style="background:${escapeHtml(color)}" aria-hidden="true"></span>`).join("")}</div></div><span class="product-price">${money(product.price)}</span></div>
    </article>`).join("");
  productGrid.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error",() => {
      image.src = image.dataset.fallback;
      image.alt = image.dataset.fallbackAlt;
      image.classList.remove("has-photo");
      image.removeAttribute("data-fallback");
      image.removeAttribute("data-fallback-alt");
      image.closest(".product-image-wrap").querySelector(".photo-credit")?.remove();
    },{once:true});
  });
}

function renderCart() {
  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = cart.reduce((total, line) => {
    const product = products.find((item) => item.id === line.id);
    return total + (product.price + (line.configuration?.stringing_service ? 500 : 0)) * line.quantity;
  }, 0);
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  $("#subtotal").textContent = money(subtotal);
  $("#checkoutTotal").textContent = money(subtotal);
  $("#cartEmpty").hidden = count > 0;
  $("#cartFooter").hidden = count === 0;
  $("#cartItems").innerHTML = cart.map((line,index) => {
    const product = products.find((item) => item.id === line.id);
    const unitPrice = product.price + (line.configuration?.stringing_service ? 500 : 0);
    const setup = line.configuration ? ` · ${line.configuration.brand} · ${line.configuration.tension} lb · ${line.configuration.grip}` : "";
    const heldByOtherLines = cart.filter((other,otherIndex) => other.id === product.id && otherIndex !== index).reduce((sum,other) => sum + other.quantity,0);
    const stockForLine = (store.stock[product.id] ?? product.stock) - heldByOtherLines;
    return `<article class="cart-line">
      <img src="${escapeHtml(product.image)}" alt="">
      <div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.brand)} · ${escapeHtml(product.category)}${escapeHtml(setup)}</p><div class="quantity-control"><button data-quantity="${index}" data-change="-1" aria-label="Decrease ${escapeHtml(product.name)} quantity">−</button><span>${line.quantity}</span><button data-quantity="${index}" data-change="1" aria-label="Increase ${escapeHtml(product.name)} quantity" ${line.quantity >= stockForLine ? "disabled" : ""}>+</button></div></div>
      <div><div class="line-price">${money(unitPrice * line.quantity)}</div><button class="remove-item" data-remove="${index}">Remove</button></div>
    </article>`;
  }).join("");
}

function addToCart(id, configuration = null) {
  const product = products.find((item) => item.id === id);
  if (!product || availableStock(product) < 1) return showToast("That item has reached its available stock.");
  const configKey = JSON.stringify(configuration);
  const currentIndex = cart.findIndex((line) => line.id === id && JSON.stringify(line.configuration ?? null) === configKey);
  const next = currentIndex >= 0
    ? cart.map((line,index) => index === currentIndex ? {...line,quantity:line.quantity+1} : line)
    : [...cart,{id,quantity:1,configuration}];
  if (persistCart(next)) {
    renderCart();
    renderProducts();
    showToast(`${products.find((item) => item.id === id).name} added to your bag.`);
  }
}

function changeQuantity(index, amount) {
  const current = cart[index];
  if (!current) return;
  const product = products.find((item) => item.id === current.id);
  const quantity = current.quantity + amount;
  const reservedByOtherLines = cart.filter((line,lineIndex) => line.id === product.id && lineIndex !== index).reduce((sum,line) => sum + line.quantity,0);
  if (quantity + reservedByOtherLines > (store.stock[product.id] ?? product.stock)) return showToast("That is all the stock currently available.");
  const next = quantity < 1 ? cart.filter((_line,lineIndex) => lineIndex !== index) : cart.map((line,lineIndex) => lineIndex === index ? {...line,quantity} : line);
  if (persistCart(next)) {
    renderCart();
    renderProducts();
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function openLayer(layer) {
  closeLayers();
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("visible"));
  layer.hidden = false;
  requestAnimationFrame(() => layer.classList.add("open"));
  if (layer === cartDrawer) layer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLayers() {
  overlay.classList.remove("visible");
  cartDrawer.classList.remove("open");
  authModal.classList.remove("open");
  profileModal.classList.remove("open");
  checkoutModal.classList.remove("open");
  $("#feedbackModal").classList.remove("open");
  $("#racketModal").classList.remove("open");
  $("#trackingModal").classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    if (!overlay.classList.contains("visible")) {
      overlay.hidden = true;
      authModal.hidden = true;
      profileModal.hidden = true;
      checkoutModal.hidden = true;
      $("#feedbackModal").hidden = true;
      $("#racketModal").hidden = true;
      $("#trackingModal").hidden = true;
    }
  }, 260);
}

function setAuthMode(mode) {
  authMode = mode;
  $("#authMessage").textContent = "";
  document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === mode));
  $("#authTitle").innerHTML = mode === "login" ? "Good to have<br><span>you here.</span>" : "Make room for<br><span>good things.</span>";
  $("#authDescription").textContent = mode === "login" ? "Sign in or create an account to keep your gear and orders together." : "Create an account to keep your gear and orders together.";
  $("#authSubmit").innerHTML = mode === "login" ? "Sign in <span>→</span>" : "Create account <span>→</span>";
  $("#authNameField").hidden = mode !== "signup";
  $("#authName").required = mode === "signup";
  $("#passwordField").hidden = false;
  $("#authPassword").required = true;
  $("#forgotButton").hidden = mode !== "login";
  $("#authPassword").autocomplete = mode === "login" ? "current-password" : "new-password";
}

function checkoutSnapshot() {
  return cart.map((line) => {
    const product = products.find((item) => item.id === line.id);
    return {
      id:product.id,
      product_id:product.id,
      name:product.name,
      unitPrice:product.price + (line.configuration?.stringing_service ? 500 : 0),
      quantity:line.quantity,
      configuration:line.configuration ?? {}
    };
  });
}

function renderTrackingResult(order,result) {
  const heading = document.createElement("div");
  heading.className = "tracking-summary";
  const title = document.createElement("strong");
  title.textContent = order.trackingNumber ?? order.tracking_number;
  const status = document.createElement("span");
  status.textContent = (order.status ?? "processing").replaceAll("_"," ");
  heading.append(title,status);

  const origin = document.createElement("p");
  origin.className = "tracking-origin";
  origin.textContent = `Origin: ${order.origin ?? "Pinamaloy, Don Carlos, Bukidnon"}`;

  const existingEvents = order.trackingEvents ?? order.tracking_events ?? [];
  const eventTimeline = [
    {status:"processing",location:"Pinamaloy, Don Carlos, Bukidnon",description:"Order received by Caday Badminton"},
    {status:"shipped",location:"Pinamaloy, Don Carlos, Bukidnon",description:"Dispatched from Caday Badminton"},
    {status:"in_transit",location:"Carrier update pending",description:"In transit"},
    {status:"out_for_delivery",location:"Carrier update pending",description:"Out for delivery"},
    {status:"delivered",location:"Carrier update pending",description:"Delivered"}
  ];
  const currentStatus = order.status ?? "processing";
  const currentIndex = eventTimeline.findIndex((item) => item.status === currentStatus);
  const events = eventTimeline.map((item,index) => {
    const savedEvent = existingEvents.find((event) => (event.status ?? "").toLowerCase() === item.status);
    return {
      label:item.description,
      location:savedEvent?.location ?? item.location,
      completed:index <= currentIndex && (Boolean(savedEvent) || index === 0)
    };
  });
  existingEvents.forEach((savedEvent) => {
    const label = (savedEvent.description ?? savedEvent.status ?? "Shipment update").toLowerCase();
    const knownStatus = eventTimeline.some((item) => item.status === (savedEvent.status ?? "").toLowerCase());
    if (!knownStatus) events.splice(Math.max(currentIndex,0)+1,0,{
      label:savedEvent.description ?? savedEvent.status,
      location:savedEvent.location,
      completed:true
    });
  });

  const timeline = document.createElement("ol");
  timeline.className = "tracking-timeline";
  events.forEach((trackingEvent) => {
    const item = document.createElement("li");
    if (trackingEvent.completed) item.classList.add("completed");
    const eventTitle = document.createElement("strong");
    eventTitle.textContent = trackingEvent.label;
    const location = document.createElement("span");
    location.textContent = trackingEvent.location;
    item.append(eventTitle,location);
    timeline.append(item);
  });
  result.replaceChildren(heading,origin,timeline);
}

async function requestApi(url, options = {}) {
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type","application/json");
  const {data} = await supabaseClient.auth.getSession();
  if (data.session?.access_token) headers.set("Authorization",`Bearer ${data.session.access_token}`);
  const response = await fetch(url,{...options,headers});
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload;
}

async function refreshSupabaseProducts() {
  const rows = await requestApi("/api/products");
  products = rows.map((row) => {
    const seed = seedProducts.find((product) => product.id === row.id);
    return {
      ...seed,
      id:row.id,
      name:row.name,
      brand:row.brand,
      category:row.category,
      price:row.price_php,
      stock:row.stock,
      image:row.image_url.startsWith("generated-artwork:") ? seed?.image ?? "" : row.image_url,
      badge:seed?.badge ?? "",
      colors:seed?.colors ?? ["#283c35","#d8d6ca"]
    };
  });
  store.stock = Object.fromEntries(products.map((product) => [product.id,product.stock]));
  renderProducts();
  renderCart();
}

function updateAccountButton() {
  $("#accountButton").textContent = currentUser ? "My account" : "Sign in";
}

async function loadClientProfile() {
  const profile = await requestApi("/api/profile");
  clientProfile = profile;
  return profile;
}

async function openClientProfile() {
  if (!supabaseConfigured || !currentUser) {
    setAuthMode("login");
    openLayer(authModal);
    return;
  }
  $("#profileEmail").value = currentUser.email ?? "";
  $("#profileMessage").textContent = "";
  $("#profileMessage").classList.remove("is-success");
  $("#profileName").value = clientProfile?.full_name ?? currentUser.user_metadata?.full_name ?? "";
  $("#profilePhone").value = clientProfile?.phone ?? currentUser.phone ?? "";
  $("#profileAddress").value = clientProfile?.delivery_address ?? "";
  openLayer(profileModal);
  try {
    const profile = await loadClientProfile();
    $("#profileEmail").value = profile.email ?? currentUser.email ?? "";
    $("#profileName").value = profile.full_name ?? "";
    $("#profilePhone").value = profile.phone ?? "";
    $("#profileAddress").value = profile.delivery_address ?? "";
  } catch (error) {
    $("#profileMessage").textContent = `Could not load your profile: ${error.message}`;
  }
}

async function connectSupabase() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `Configuration request failed (${response.status}).`);
    }
    const config = await response.json();
    if (!config.supabaseUrl || !config.anonKey || !window.supabase?.createClient) {
      throw new Error("Supabase authentication is not configured for this website.");
    }
    supabaseClient = window.supabase.createClient(config.supabaseUrl,config.anonKey);
    supabaseConfigured = true;
    const {data,error} = await supabaseClient.auth.getSession();
    if (error) throw error;
    currentUser = data.session?.user ?? null;
    clientProfile = null;
    updateAccountButton();
    $("#authModal .demo-disclaimer").textContent = "Sign-in and account recovery are handled by your configured Supabase project.";
    $(".cart-footer .secure-note").textContent = "🔒 Supabase order storage · Payment processing is not configured";
    $("#trackingModal .demo-disclaimer").textContent = "Tracking is customer-authenticated. Admins add shipment scans; live carrier updates require carrier integration.";
    supabaseClient.auth.onAuthStateChange((_event,session) => {
      currentUser = session?.user ?? null;
      if (!currentUser) clientProfile = null;
      updateAccountButton();
    });
    document.body.classList.add("supabase-connected");
    if (currentUser) {
      try {
        await loadClientProfile();
      } catch (error) {
        showToast(`Your account is signed in, but profile data could not be loaded: ${error.message}`);
      }
    }
    try {
      await refreshSupabaseProducts();
    } catch (error) {
      showToast(`Account sign-in is ready, but shop data could not be loaded: ${error.message}`);
    }
  } catch (error) {
    $("#authMessage").textContent = `Account service unavailable: ${error.message}`;
    $("#authModal .demo-disclaimer").textContent = "Sign-in is unavailable until valid Supabase project settings are configured.";
    showToast(`Account service unavailable: ${error.message}`);
  }
}

productGrid.addEventListener("click", (event) => {
  const customizeButton = event.target.closest("[data-customize]");
  if (customizeButton) {
    openRacketCustomizer(customizeButton.dataset.customize);
    return;
  }
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

$("#cartItems").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) {
    const index = Number(removeButton.dataset.remove);
    if (persistCart(cart.filter((_line,lineIndex) => lineIndex !== index))) {
      renderCart();
      renderProducts();
    }
  }
});

$("#cartButton").addEventListener("click", () => openLayer(cartDrawer));
$("#feedbackButton").addEventListener("click",() => {
  if (!supabaseConfigured || !currentUser) {
    setAuthMode("login");
    openLayer(authModal);
    showToast("Sign in to send feedback.");
    return;
  }
  openLayer($("#feedbackModal"));
});
$("#accountButton").addEventListener("click", () => {
  if (currentUser) return openClientProfile();
  setAuthMode("login");
  openLayer(authModal);
});
$("#overlay").addEventListener("click", closeLayers);
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeLayers));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLayers();
});

document.querySelectorAll(".category-tab").forEach((button) => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
  renderProducts();
}));

document.querySelectorAll(".brand-chip").forEach((button) => button.addEventListener("click", () => {
  activeBrand = button.dataset.brand;
  document.querySelectorAll(".brand-chip").forEach((chip) => chip.classList.toggle("active", chip === button));
  renderProducts();
}));

document.querySelectorAll("[data-category-link]").forEach((link) => link.addEventListener("click", () => {
  activeCategory = link.dataset.categoryLink;
  document.querySelectorAll(".category-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.category === activeCategory));
  renderProducts();
  $(".main-nav").classList.remove("open");
  $("#menuButton").setAttribute("aria-expanded", "false");
}));

function populateRacketModels(brand, selectedId) {
  const models = products.filter((product) => product.category === "Rackets" && product.brand === brand);
  $("#racketProduct").innerHTML = models.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} · ${money(product.price)}</option>`).join("");
  if (models.some((product) => product.id === selectedId)) $("#racketProduct").value = selectedId;
}

function openRacketCustomizer(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || product.category !== "Rackets") return showToast("Choose a racket to customize.");
  if (availableStock(product) < 1) return showToast("That racket is out of stock.");
  $("#racketBrand").innerHTML = BRANDS.map((brand) => `<option value="${brand}">${brand}</option>`).join("");
  $("#racketBrand").value = product.brand;
  populateRacketModels(product.brand,productId);
  $("#racketTension").innerHTML = Array.from({length:13},(_value,index) => `<option value="${18+index}">${18+index} lb</option>`).join("");
  $("#racketTension").value = "24";
  $("#racketGrip").value = "G5";
  $("#stringingService").checked = false;
  openLayer($("#racketModal"));
}

$("#racketBrand").addEventListener("change", () => populateRacketModels($("#racketBrand").value,null));

$("#racketForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = $("#racketProduct").value;
  const configuration = {
    brand:$("#racketBrand").value,
    tension:Number($("#racketTension").value),
    grip:$("#racketGrip").value,
    stringing_service:$("#stringingService").checked
  };
  if (!BRANDS.includes(configuration.brand) || configuration.tension < 18 || configuration.tension > 30
    || !["G4","G5","G6"].includes(configuration.grip)) return showToast("Choose a valid racket setup.");
  addToCart(id,configuration);
  closeLayers();
});

$("#searchInput").addEventListener("input", renderProducts);
$(".search-toggle").addEventListener("click", () => {
  $("#shop").scrollIntoView({behavior:"smooth"});
  setTimeout(() => $("#searchInput").focus(), 350);
});
$("#menuButton").addEventListener("click", () => {
  const nav = $(".main-nav");
  const isOpen = nav.classList.toggle("open");
  $("#menuButton").setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".auth-tab").forEach((tab) => tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode)));
$("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("#authEmail").value.trim();
  const fullName = $("#authName").value.trim();
  if (!email) return showToast("Enter a valid email address.");
  if (authMode === "signup" && !fullName) {
    $("#authName").focus();
    return showToast("Enter your full name to create an account.");
  }
  if (!supabaseConfigured || !supabaseClient) {
    const message = "Sign-in is unavailable. Configure your Supabase URL and publishable/anon key, then restart the site.";
    $("#authMessage").textContent = message;
    showToast(message);
    return;
  }

  const mode = authMode;
  const submitButton = $("#authSubmit");
  $("#authMessage").textContent = "";
  submitButton.disabled = true;
  try {
    const password = $("#authPassword").value;
    const result = mode === "login"
      ? await supabaseClient.auth.signInWithPassword({email,password})
      : await supabaseClient.auth.signUp({
        email,
        password,
        options: {emailRedirectTo: location.origin,data:{full_name:fullName}}
      });
    if (result.error) throw result.error;
    if (mode === "signup" && !result.data.session) {
      $("#authPassword").value = "";
      const message = "Account created. Check your email to confirm it before signing in.";
      $("#authMessage").textContent = message;
      showToast(message);
      return;
    }
    currentUser = result.data.user;
    updateAccountButton();
    if (currentUser && result.data.session) {
      try {
        await loadClientProfile();
      } catch (error) {
        showToast(`Account created, but profile data could not be loaded: ${error.message}`);
      }
    }
    closeLayers();
    showToast(mode === "login" ? "Signed in securely with Supabase." : "Your Supabase account is ready.");
  } catch (error) {
    $("#authMessage").textContent = error.message;
    showToast(`Authentication failed: ${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
});

$("#forgotButton").addEventListener("click", () => {
  const email = $("#authEmail").value.trim();
  if (!email) {
    showToast("Enter your email address for password recovery.");
    $("#authEmail").focus();
    return;
  }
  if (!supabaseConfigured || !supabaseClient) {
    showToast("Password recovery is unavailable because Supabase is not configured.");
    return;
  }
  supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/reset-password.html`})
    .then(({error}) => showToast(error ? `Could not send recovery email: ${error.message}` : "If that address has an account, password recovery instructions are on the way."))
    .catch((error) => showToast(`Could not send recovery email: ${error.message}`));
});

$("#profileForm").addEventListener("submit",async (event) => {
  event.preventDefault();
  if (!currentUser || !supabaseClient) {
    $("#profileMessage").textContent = "Sign in to edit your profile.";
    return;
  }
  const button = $("#saveProfileButton");
  button.disabled = true;
  $("#profileMessage").textContent = "";
  $("#profileMessage").classList.remove("is-success");
  try {
    const profile = await requestApi("/api/profile",{
      method:"PATCH",
      body:JSON.stringify({
        full_name:$("#profileName").value.trim(),
        phone:$("#profilePhone").value.trim(),
        delivery_address:$("#profileAddress").value.trim()
      })
    });
    clientProfile = profile;
    $("#profileMessage").textContent = "Your profile has been saved.";
    $("#profileMessage").classList.add("is-success");
    $("#checkoutName").value = profile.full_name;
    $("#checkoutPhone").value = profile.phone;
    $("#checkoutAddress").value = profile.delivery_address;
  } catch (error) {
    $("#profileMessage").textContent = `Could not save your profile: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

$("#profileSignOut").addEventListener("click",async () => {
  const {error} = await supabaseClient.auth.signOut();
  if (error) {
    $("#profileMessage").textContent = `Sign out failed: ${error.message}`;
    return;
  }
  currentUser = null;
  clientProfile = null;
  updateAccountButton();
  closeLayers();
  showToast("You have signed out.");
});

$("#feedbackForm").addEventListener("submit",async (event) => {
  event.preventDefault();
  if (!supabaseConfigured || !currentUser) {
    showToast("Sign in to send feedback.");
    return;
  }
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await requestApi("/api/feedback",{
      method:"POST",
      body:JSON.stringify({
        rating:Number($("#feedbackRating").value),
        message:$("#feedbackMessage").value.trim()
      })
    });
    event.currentTarget.reset();
    closeLayers();
    showToast("Thanks for sharing your feedback.");
  } catch (error) {
    showToast(`Could not send feedback: ${error.message}`);
  } finally {
    button.disabled = false;
  }
});

$("#checkoutButton").addEventListener("click", () => {
  if (!cart.length) return showToast("Add an item before checking out.");
  if (supabaseConfigured && !currentUser) {
    showToast("Sign in to place an order.");
    setAuthMode("login");
    openLayer(authModal);
    return;
  }
  activeCheckoutSnapshot = checkoutSnapshot();
  $("#checkoutTitle").innerHTML = supabaseConfigured ? "Secure <span>checkout.</span>" : "Checkout <span>demo.</span>";
  $(".checkout-modal .modal-intro").textContent = supabaseConfigured
    ? "Choose a payment preference. Payment is not processed yet; this prototype records the order securely in Supabase."
    : "Choose a demo payment method. No payment details or money are collected.";
  $("#checkoutForm button[type=submit]").innerHTML = supabaseConfigured ? "Place order <span>→</span>" : "Place demo order <span>→</span>";
  $("#checkoutEmail").value = currentUser?.email ?? "";
  $("#checkoutName").value = clientProfile?.full_name ?? currentUser?.user_metadata?.full_name ?? currentUser?.user_metadata?.name ?? "";
  $("#checkoutPhone").value = clientProfile?.phone ?? currentUser?.phone ?? currentUser?.user_metadata?.phone ?? "";
  $("#checkoutAddress").value = clientProfile?.delivery_address ?? "";
  openLayer(checkoutModal);
});

$("#checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("#checkoutEmail").value.trim();
  const customerName = $("#checkoutName").value.trim();
  const customerPhone = $("#checkoutPhone").value.trim();
  const deliveryAddress = $("#checkoutAddress").value.trim();
  const payment = new FormData(event.currentTarget).get("payment");
  const items = activeCheckoutSnapshot;
  if (!email || !customerName || !customerPhone || !deliveryAddress || !items?.length
    || !["card","paypal","cash"].includes(payment)) return showToast("Check your contact details, delivery address, bag, and payment selection.");
  const requestedByProduct = new Map();
  for (const item of items) requestedByProduct.set(item.id,(requestedByProduct.get(item.id) ?? 0) + item.quantity);
  if ([...requestedByProduct].some(([id,quantity]) => quantity > (store.stock[id] ?? products.find((product) => product.id === id)?.stock ?? 0))) {
    showToast("Stock changed while you were checking out. Review your bag.");
    closeLayers();
    renderCart();
    renderProducts();
    return;
  }
  if (supabaseConfigured) {
    const requestItems = items.map((item) => ({
      product_id:item.product_id,
      quantity:item.quantity,
      configuration:item.configuration
    }));
    requestApi("/api/orders",{
      method:"POST",
      body:JSON.stringify({
        items:requestItems,
        payment_method:payment,
        customer_name:customerName,
        customer_phone:customerPhone,
        delivery_address:deliveryAddress
      })
    }).then(async (order) => {
      try {
        localStorage.setItem(STORAGE_KEY,JSON.stringify({...store,cart:[]}));
      } catch {
        showToast("Order was saved, but this browser could not clear its cached bag.");
      }
      cart = [];
      store = {...store,cart};
      renderCart();
      await refreshSupabaseProducts();
      closeLayers();
      activeCheckoutSnapshot = null;
      event.currentTarget.reset();
      showToast(`Order saved. Tracking number: ${order.tracking_number}. Payment is not processed.`);
    }).catch((error) => showToast(`Could not place order: ${error.message}`));
    return;
  }
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let trackingNumber;
  do {
    trackingNumber = `CAD-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  } while (store.orders.some((savedOrder) => savedOrder.trackingNumber === trackingNumber));
  const shippedAt = new Date().toISOString();
  const pickupLocation = "Caday Badminton · Pinamaloy, Don Carlos, Bukidnon";
  const order = {
    id:`DEMO-${Date.now()}`,
    email,
    payment,
    items,
    total,
    status:"Shipped",
    trackingNumber,
    createdAt:shippedAt,
    trackingEvents:[
      {label:"Order confirmed",location:pickupLocation,completed:true,time:shippedAt},
      {label:"Shipped from shop",location:pickupLocation,completed:true,time:shippedAt}
    ]
  };
  const purchasedQuantities = new Map();
  for (const item of items) purchasedQuantities.set(item.id,(purchasedQuantities.get(item.id) ?? 0) + item.quantity);
  const remainingCart = cart.map((line) => ({
    ...line,
    quantity:line.quantity - (purchasedQuantities.get(line.id) || 0)
  })).filter((line) => line.quantity > 0);
  const remainingStock = {...store.stock};
  for (const item of items) remainingStock[item.id] -= item.quantity;
  try {
    const nextStore = {...store,cart:remainingCart,stock:remainingStock,orders:[...store.orders,order]};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
    store = nextStore;
    cart = nextStore.cart;
  } catch {
    showToast("Could not save this demo order. Your bag is unchanged.");
    return;
  }
  renderCart();
  renderProducts();
  closeLayers();
  activeCheckoutSnapshot = null;
  event.currentTarget.reset();
  showToast(`Demo order shipped. Track it with ${order.trackingNumber}. No payment was processed.`);
});

$("#trackButton").addEventListener("click", () => {
  $("#trackingResult").replaceChildren();
  openLayer($("#trackingModal"));
});

$("#trackNav").addEventListener("click",(event) => {
  event.preventDefault();
  $(".main-nav").classList.remove("open");
  $("#menuButton").setAttribute("aria-expanded","false");
  $("#trackingResult").replaceChildren();
  openLayer($("#trackingModal"));
});

$("#trackingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const trackingNumber = $("#trackingNumber").value.trim().toUpperCase();
  const result = $("#trackingResult");
  result.replaceChildren();
  if (supabaseConfigured) {
    if (!currentUser) {
      showToast("Sign in to track your order.");
      closeLayers();
      setAuthMode("login");
      openLayer(authModal);
      return;
    }
    requestApi(`/api/orders/${encodeURIComponent(trackingNumber)}`)
      .then((order) => renderTrackingResult(order,result))
      .catch((error) => {
        const message = document.createElement("p");
        message.className = "tracking-not-found";
        message.textContent = error.message;
        result.replaceChildren(message);
      });
    return;
  }
  const order = store.orders.find((savedOrder) => savedOrder.trackingNumber === trackingNumber);
  if (!order) {
    const message = document.createElement("p");
    message.className = "tracking-not-found";
    message.textContent = "We couldn't find that demo tracking number. Check it and try again.";
    result.append(message);
    return;
  }
  renderTrackingResult({
    trackingNumber:order.trackingNumber,
    status:"shipped",
    trackingEvents:order.trackingEvents.map((item) => ({
      status:item.label.toLowerCase().includes("shipped") ? "shipped" : "processing",
      location:item.location,
      description:item.label
    }))
  },result);
});

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  event.currentTarget.reset();
  showToast("You're on the list — demo signup only, no email was stored.");
});

renderProducts();
renderCart();
connectSupabase();
