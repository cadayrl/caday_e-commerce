import "dotenv/config";
import path from "node:path";
import {fileURLToPath} from "node:url";
import express from "express";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
import {createClient} from "@supabase/supabase-js";

const requiredEnvironment = ["SUPABASE_URL","SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY"];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length) {
  throw new Error(`Missing required environment values: ${missingEnvironment.join(", ")}. Copy .env.example to .env and configure Supabase.`);
}

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicClient = createClient(supabaseUrl, anonKey, {auth:{persistSession:false,autoRefreshToken:false}});
const serviceClient = createClient(supabaseUrl, serviceRoleKey, {auth:{persistSession:false,autoRefreshToken:false}});
const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const categories = new Set(["Rackets","Shuttlecocks","Shoes","Strings","Apparel","Accessories"]);
const brands = new Set(["Yonex","Victor","Li-Ning","Babolat","Kawasaki"]);
const orderStatuses = new Set(["processing","shipped","in_transit","out_for_delivery","delivered","cancelled"]);

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy:{policy:"cross-origin"},
  contentSecurityPolicy:{directives:{
    defaultSrc:["'self'"],
    scriptSrc:["'self'","https://cdn.jsdelivr.net","'unsafe-inline'"],
    styleSrc:["'self'","https://fonts.googleapis.com","'unsafe-inline'"],
    fontSrc:["'self'","https://fonts.gstatic.com","data:"],
    imgSrc:["'self'","data:","https://images.unsplash.com","https://upload.wikimedia.org","https://*.supabase.co","https://www.yonex.com","https://dkjulgymkya8y.cloudfront.net","https://sg.lining.studio","https://li-ning.co.uk","https://media.babolat.com","https://kawasaki-sport.eu","https://www.badmintonwarehouse.com","https://cdn.shopify.com"],
    connectSrc:["'self'","https://*.supabase.co","wss://*.supabase.co"],
    upgradeInsecureRequests:null
  }}
}));
app.use(express.json({limit:"32kb"}));
app.use("/api", rateLimit({windowMs:60_000,limit:120,standardHeaders:"draft-8",legacyHeaders:false}));
app.get("/api/config", (_request,response) => response.json({supabaseUrl,anonKey}));

async function authenticate(request,response,next) {
  const token = request.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return response.status(401).json({error:"Sign in is required."});
  const {data,error} = await publicClient.auth.getUser(token);
  if (error || !data.user) return response.status(401).json({error:"Your session is invalid or expired."});
  request.user = data.user;
  request.accessToken = token;
  next();
}

async function requireAdmin(request,response,next) {
  const {data,error} = await serviceClient.from("profiles").select("role").eq("user_id",request.user.id).maybeSingle();
  if (error) return response.status(500).json({error:"Could not verify admin permissions."});
  if (data?.role !== "admin") return response.status(403).json({error:"Administrator access is required."});
  request.adminId = request.user.id;
  next();
}

function userClient(token) {
  return createClient(supabaseUrl, anonKey, {
    auth:{persistSession:false,autoRefreshToken:false},
    global:{headers:{Authorization:`Bearer ${token}`}}
  });
}

function reportSupabaseError(response,error) {
  if (error?.code === "PGRST116") return response.status(404).json({error:"The requested record was not found."});
  console.error("Supabase request failed:", error?.message || error);
  return response.status(400).json({error:error?.message || "Supabase request failed."});
}

app.get("/api/products", async (_request,response) => {
  const {data,error} = await serviceClient.from("products")
    .select("id,name,brand,category,price_php,stock,image_url,active")
    .eq("active",true)
    .order("category")
    .order("name");
  if (error) return reportSupabaseError(response,error);
  response.json(data);
});

app.post("/api/orders", authenticate, async (request,response) => {
  const {items,payment_method:paymentMethod} = request.body ?? {};
  const allowedPaymentMethods = new Set(["card","paypal","cash"]);
  if (!Array.isArray(items) || items.length < 1 || items.length > 50
    || !allowedPaymentMethods.has(paymentMethod)) {
    return response.status(400).json({error:"Provide order items and a valid payment method."});
  }
  const cleanItems = [];
  for (const item of items) {
    if (typeof item?.product_id !== "string" || !item.product_id
      || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return response.status(400).json({error:"An order item has invalid product or quantity values."});
    }
    const configuration = item.configuration && typeof item.configuration === "object" ? item.configuration : {};
    cleanItems.push({product_id:item.product_id,quantity:item.quantity,configuration});
  }
  const {data,error} = await userClient(request.accessToken).rpc("place_order", {
    p_items:cleanItems,
    p_payment_method:paymentMethod
  });
  if (error) return reportSupabaseError(response,error);
  response.status(201).json(data?.[0] ?? data);
});

app.get("/api/orders/:trackingNumber", authenticate, async (request,response) => {
  const {data,error} = await userClient(request.accessToken).from("orders")
    .select("id,tracking_number,status,total_php,origin,created_at,order_items(product_name,unit_price_php,quantity,configuration),tracking_events(status,location,description,occurred_at)")
    .eq("tracking_number",request.params.trackingNumber.toUpperCase())
    .maybeSingle();
  if (error) return reportSupabaseError(response,error);
  if (!data) return response.status(404).json({error:"No order was found for this tracking number."});
  response.json(data);
});

app.get("/api/admin/me", authenticate, requireAdmin, (request,response) => {
  response.json({id:request.adminId,role:"admin"});
});

app.get("/api/admin/products", authenticate, requireAdmin, async (_request,response) => {
  const {data,error} = await serviceClient.from("products")
    .select("id,name,brand,category,price_php,stock,image_url,active,created_at")
    .order("category").order("name");
  if (error) return reportSupabaseError(response,error);
  response.json(data);
});

function validateProduct(body) {
  const validImage = typeof body?.image_url === "string" && body.image_url.length <= 2048
    && (/^https:\/\/\S+$/i.test(body.image_url)
      || (body.image_url.startsWith("/assets/") && !body.image_url.includes(".."))
      || body.image_url === `generated-artwork:${body.id}`);
  return body && typeof body.id === "string" && /^[a-z0-9][a-z0-9-]{2,63}$/.test(body.id)
    && typeof body.name === "string" && body.name.trim().length > 0 && body.name.length <= 120
    && brands.has(body.brand) && categories.has(body.category)
    && Number.isInteger(body.price_php) && body.price_php > 0
    && Number.isInteger(body.stock) && body.stock >= 0
    && validImage
    && (body.active === undefined || typeof body.active === "boolean");
}

app.post("/api/admin/products", authenticate, requireAdmin, async (request,response) => {
  if (!validateProduct(request.body)) return response.status(400).json({error:"Product fields are invalid."});
  const {data,error} = await serviceClient.from("products").insert({
    id:request.body.id,
    name:request.body.name.trim(),
    brand:request.body.brand,
    category:request.body.category,
    price_php:request.body.price_php,
    stock:request.body.stock,
    image_url:request.body.image_url,
    active:request.body.active ?? true
  }).select().single();
  if (error) return reportSupabaseError(response,error);
  response.status(201).json(data);
});

app.patch("/api/admin/products/:id", authenticate, requireAdmin, async (request,response) => {
  if (!validateProduct({...request.body,id:request.params.id})) return response.status(400).json({error:"Product fields are invalid."});
  const {data,error} = await serviceClient.from("products").update({
    name:request.body.name.trim(),
    brand:request.body.brand,
    category:request.body.category,
    price_php:request.body.price_php,
    stock:request.body.stock,
    image_url:request.body.image_url,
    active:request.body.active ?? true
  }).eq("id",request.params.id).select().single();
  if (error) return reportSupabaseError(response,error);
  response.json(data);
});

app.get("/api/admin/orders", authenticate, requireAdmin, async (_request,response) => {
  const {data,error} = await serviceClient.from("orders")
    .select("id,user_id,tracking_number,status,payment_method,total_php,origin,created_at,order_items(product_name,quantity,configuration),tracking_events(status,location,description,occurred_at)")
    .order("created_at",{ascending:false})
    .limit(100);
  if (error) return reportSupabaseError(response,error);
  response.json(data);
});

app.post("/api/admin/orders/:id/tracking", authenticate, requireAdmin, async (request,response) => {
  const {status,location,description} = request.body ?? {};
  if (!orderStatuses.has(status) || typeof location !== "string" || !location.trim()
    || location.length > 200 || typeof description !== "string" || !description.trim() || description.length > 500) {
    return response.status(400).json({error:"Tracking status, location, and update note are required."});
  }
  const {data,error} = await serviceClient.rpc("admin_add_tracking_event",{
    p_admin_id:request.adminId,
    p_order_id:request.params.id,
    p_status:status,
    p_location:location.trim(),
    p_description:description.trim()
  });
  if (error) return reportSupabaseError(response,error);
  response.json(data);
});

app.use("/api", (_request,response) => response.status(404).json({error:"API route not found."}));
app.use(["/server","/supabase","/node_modules"],(_request,response) => response.sendStatus(404));
app.use(express.static(root,{extensions:["html"]}));
app.get("/{*path}", (_request,response) => response.sendFile(path.join(root,"index.html")));

app.listen(port, () => console.log(`Caday Badminton is running at http://localhost:${port}`));
