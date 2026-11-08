import "dotenv/config";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {pathToFileURL} from "node:url";
import express from "express";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
import {createClient} from "@supabase/supabase-js";
import pg from "pg";

const {Pool} = pg;
const requiredEnvironment = ["DATABASE_URL","SUPABASE_URL","SUPABASE_ANON_KEY"];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
if (missingEnvironment.length) {
  throw new Error(`Missing required environment values: ${missingEnvironment.join(", ")}. Configure Vercel or copy .env.example to .env.`);
}

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const publicClient = createClient(supabaseUrl,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
const pool = globalThis.cadayDatabasePool ??= new Pool({
  connectionString:process.env.DATABASE_URL,
  max:1,
  idleTimeoutMillis:10_000,
  connectionTimeoutMillis:5_000
});
const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const categories = new Set(["Rackets","Shuttlecocks","Shoes","Strings","Apparel","Accessories"]);
const brands = new Set(["Yonex","Victor","Li-Ning","Babolat","Kawasaki"]);
const orderStatuses = new Set(["processing","shipped","in_transit","out_for_delivery","delivered","cancelled"]);
const paymentStatuses = new Set(["not_processed","pending","processing","succeeded","failed","refunded"]);

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
app.use("/api",rateLimit({windowMs:60_000,limit:120,standardHeaders:"draft-8",legacyHeaders:false}));

app.get("/api/config",(_request,response) => {
  response.set("Cache-Control","no-store");
  response.json({supabaseUrl,anonKey});
});

async function authenticate(request,response,next) {
  const token = request.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return response.status(401).json({error:"Sign in is required."});
  const {data,error} = await publicClient.auth.getUser(token);
  if (error || !data.user) return response.status(401).json({error:"Your session is invalid or expired."});
  request.user = data.user;
  next();
}

async function requireAdmin(request,response,next) {
  try {
    const {rows} = await pool.query("select role from public.profiles where user_id = $1",[request.user.id]);
    if (rows[0]?.role !== "admin") return response.status(403).json({error:"Administrator access is required."});
    request.adminId = request.user.id;
    next();
  } catch (error) {
    console.error("Could not verify admin permissions:",error.message);
    response.status(500).json({error:"Could not verify admin permissions."});
  }
}

function reportDatabaseError(response,error) {
  console.error("Database request failed:",error?.message || error);
  if (error?.code === "23505") return response.status(409).json({error:"A record with those details already exists."});
  if (["23503","23514","22P02"].includes(error?.code)) {
    return response.status(400).json({error:"The submitted data is invalid."});
  }
  return response.status(500).json({error:"The database request could not be completed."});
}

function validateConfiguration(configuration) {
  if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)) return false;
  if (configuration.brand !== undefined && !brands.has(configuration.brand)) return false;
  if (configuration.tension !== undefined
    && (!Number.isInteger(configuration.tension) || configuration.tension < 18 || configuration.tension > 30)) return false;
  if (configuration.grip !== undefined && !["G4","G5","G6"].includes(configuration.grip)) return false;
  return configuration.stringing_service === undefined || typeof configuration.stringing_service === "boolean";
}

app.get("/api/products",async (_request,response) => {
  try {
    const {rows} = await pool.query(
      "select id,name,brand,category,price_php,stock,image_url,active from public.products where active = true order by category,name"
    );
    response.json(rows);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.get("/api/profile",authenticate,async (request,response) => {
  try {
    await pool.query(
      `insert into public.profiles (user_id,full_name)
       select $1,coalesce(raw_user_meta_data->>'full_name','')
       from auth.users where id=$1
       on conflict (user_id) do nothing`,
      [request.user.id]
    );
    const {rows} = await pool.query(
      `select p.full_name,p.phone,p.delivery_address
       from public.profiles p where p.user_id=$1`,
      [request.user.id]
    );
    if (!rows[0]) return response.status(404).json({error:"Customer profile was not found."});
    response.json({email:request.user.email,...rows[0]});
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.patch("/api/profile",authenticate,async (request,response) => {
  const {full_name:fullName,phone,delivery_address:deliveryAddress} = request.body ?? {};
  if (typeof fullName !== "string" || !fullName.trim() || fullName.trim().length > 120
    || typeof phone !== "string" || phone.length > 40
    || typeof deliveryAddress !== "string" || deliveryAddress.length > 500) {
    return response.status(400).json({error:"Enter a name (up to 120 characters), phone (up to 40), and delivery address (up to 500)."});
  }

  try {
    const {rows} = await pool.query(
      `insert into public.profiles (user_id,full_name,phone,delivery_address)
       values ($1,$2,$3,$4)
       on conflict (user_id) do update
         set full_name=excluded.full_name,phone=excluded.phone,delivery_address=excluded.delivery_address
       returning full_name,phone,delivery_address`,
      [request.user.id,fullName.trim(),phone.trim(),deliveryAddress.trim()]
    );
    response.json({email:request.user.email,...rows[0]});
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.post("/api/orders",authenticate,async (request,response) => {
  const {items,payment_method:paymentMethod,customer_name:customerName,customer_phone:customerPhone,delivery_address:deliveryAddress} = request.body ?? {};
  if (!Array.isArray(items) || items.length < 1 || items.length > 50
    || !["card","paypal","cash"].includes(paymentMethod)) {
    return response.status(400).json({error:"Provide order items and a valid payment method."});
  }
  if (typeof customerName !== "string" || !customerName.trim() || customerName.trim().length > 120
    || typeof customerPhone !== "string" || !customerPhone.trim() || customerPhone.trim().length > 40
    || typeof deliveryAddress !== "string" || !deliveryAddress.trim() || deliveryAddress.trim().length > 500) {
    return response.status(400).json({error:"Enter a customer name, phone number, and delivery address."});
  }

  const groupedItems = new Map();
  for (const item of items) {
    if (typeof item?.product_id !== "string" || !item.product_id
      || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100
      || !validateConfiguration(item.configuration ?? {})) {
      return response.status(400).json({error:"An order item has invalid product, quantity, or configuration values."});
    }
    const configuration = item.configuration ?? {};
    const key = `${item.product_id}:${JSON.stringify(configuration)}`;
    const existing = groupedItems.get(key);
    groupedItems.set(key,{productId:item.product_id,quantity:item.quantity + (existing?.quantity ?? 0),configuration});
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const orderIdResult = await client.query("select gen_random_uuid() as id");
    const orderId = orderIdResult.rows[0].id;
    const trackingNumber = `CAD-${orderId.replaceAll("-","").slice(0,8).toUpperCase()}`;
    let total = 0;
    const pricedItems = [];

    for (const item of [...groupedItems.values()].sort((a,b) => a.productId.localeCompare(b.productId))) {
      const {rows} = await client.query(
        "select id,name,brand,category,price_php,stock from public.products where id = $1 and active = true for update",
        [item.productId]
      );
      const product = rows[0];
      if (!product) throw Object.assign(new Error(`Product ${item.productId} is unavailable.`),{status:400});
      if (item.quantity > product.stock) {
        throw Object.assign(new Error(`Insufficient stock for product ${item.productId}.`),{status:400});
      }
      if (item.configuration.brand && item.configuration.brand !== product.brand) {
        throw Object.assign(new Error("Racket brand does not match the selected product."),{status:400});
      }
      const hasStringing = item.configuration.stringing_service === true;
      if (hasStringing && product.category !== "Rackets") {
        throw Object.assign(new Error("Stringing service is only available for rackets."),{status:400});
      }
      const unitPrice = product.price_php + (hasStringing ? 500 : 0);
      total += unitPrice * item.quantity;
      pricedItems.push({...item,product,unitPrice});
      await client.query("update public.products set stock = stock - $1 where id = $2",[item.quantity,item.productId]);
    }

    await client.query(
      `insert into public.orders
        (id,user_id,tracking_number,payment_method,total_php,customer_name,customer_phone,delivery_address)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [orderId,request.user.id,trackingNumber,paymentMethod,total,customerName.trim(),customerPhone.trim(),deliveryAddress.trim()]
    );
    await client.query(
      "insert into public.payment_transactions (order_id,user_id,payment_method,amount_php) values ($1,$2,$3,$4)",
      [orderId,request.user.id,paymentMethod,total]
    );
    for (const item of pricedItems) {
      await client.query(
        "insert into public.order_items (order_id,product_id,product_name,unit_price_php,quantity,configuration) values ($1,$2,$3,$4,$5,$6)",
        [orderId,item.product.id,item.product.name,item.unitPrice,item.quantity,item.configuration]
      );
    }
    await client.query(
      "insert into public.tracking_events (order_id,status,location,description) values ($1,'processing','Pinamaloy, Don Carlos, Bukidnon','Order received by Caday Badminton. Shipment updates will appear after dispatch.')",
      [orderId]
    );
    await client.query("commit");
    response.status(201).json({order_id:orderId,tracking_number:trackingNumber,total_php:total});
  } catch (error) {
    await client.query("rollback");
    if (error.status) return response.status(error.status).json({error:error.message});
    reportDatabaseError(response,error);
  } finally {
    client.release();
  }
});

app.get("/api/orders/:trackingNumber",authenticate,async (request,response) => {
  try {
    const {rows} = await pool.query(
      `select o.id,o.tracking_number,o.status,o.total_php,o.origin,o.created_at,
        coalesce((select json_agg(json_build_object(
          'product_name',i.product_name,'unit_price_php',i.unit_price_php,'quantity',i.quantity,'configuration',i.configuration
        ) order by i.id) from public.order_items i where i.order_id = o.id),'[]'::json) as order_items,
        coalesce((select json_agg(json_build_object(
          'status',t.status,'location',t.location,'description',t.description,'occurred_at',t.occurred_at
        ) order by t.occurred_at desc) from public.tracking_events t where t.order_id = o.id),'[]'::json) as tracking_events
       from public.orders o where o.tracking_number = $1 and o.user_id = $2`,
      [request.params.trackingNumber.toUpperCase(),request.user.id]
    );
    if (!rows[0]) return response.status(404).json({error:"No order was found for this tracking number."});
    response.json(rows[0]);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.post("/api/feedback",authenticate,async (request,response) => {
  const rating = request.body?.rating;
  const message = typeof request.body?.message === "string" ? request.body.message.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !message || message.length > 2000) {
    return response.status(400).json({error:"Choose a rating and enter feedback (up to 2,000 characters)."});
  }
  try {
    const {rows} = await pool.query(
      "insert into public.feedback (user_id,rating,message) values ($1,$2,$3) returning id,rating,message,created_at",
      [request.user.id,rating,message]
    );
    response.status(201).json(rows[0]);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.get("/api/admin/me",authenticate,requireAdmin,(request,response) => {
  response.json({id:request.adminId,role:"admin"});
});

app.get("/api/admin/overview",authenticate,requireAdmin,async (_request,response) => {
  try {
    const [summary,customers,orders,lowStock] = await Promise.all([
      pool.query(
        `select
          (select count(*)::integer from public.profiles where role='customer') as customers,
          (select count(*)::integer from public.orders) as orders,
          (select coalesce(sum(total_php),0)::integer from public.orders) as order_value_php,
          (select count(*)::integer from public.products where active=true and stock <= 5) as low_stock`
      ),
      pool.query(
        `select u.id,u.email,
          coalesce(nullif(p.full_name,''),nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),u.email) as name,
          coalesce(nullif(p.phone,''),nullif(u.phone,''),nullif(u.raw_user_meta_data->>'phone',''),'—') as phone,
          coalesce(nullif(p.delivery_address,''),(select o.delivery_address from public.orders o where o.user_id=u.id and o.delivery_address is not null order by o.created_at desc limit 1),'Not provided') as delivery_address,
          u.created_at as joined,
          (select count(*)::integer from public.orders o where o.user_id=u.id) as order_count
         from auth.users u join public.profiles p on p.user_id=u.id
         where p.role='customer' order by u.created_at desc limit 100`
      ),
      pool.query(
        `select o.id,o.tracking_number,o.status,o.total_php,o.payment_method,o.created_at,
          coalesce(nullif(o.customer_name,''),nullif(p.full_name,''),nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),u.email) as customer_name,
          u.email as customer_email,
          coalesce(nullif(o.customer_phone,''),nullif(p.phone,''),nullif(u.phone,''),nullif(u.raw_user_meta_data->>'phone',''),'—') as customer_phone,
          coalesce(nullif(o.delivery_address,''),nullif(p.delivery_address,''),'Not provided') as delivery_address,
          coalesce((select json_agg(json_build_object('product_name',i.product_name,'quantity',i.quantity) order by i.id)
            from public.order_items i where i.order_id=o.id),'[]'::json) as items,
          coalesce((select c.code from public.coupon_redemptions r join public.coupons c on c.id=r.coupon_id where r.order_id=o.id limit 1),'—') as coupon,
          coalesce((select p.status from public.payment_transactions p where p.order_id=o.id),'not_processed') as payment_status
         from public.orders o join auth.users u on u.id=o.user_id
         join public.profiles p on p.user_id=u.id
         order by o.created_at desc limit 100`
      ),
      pool.query(
        "select id,name,brand,category,stock from public.products where active=true and stock <= 5 order by stock,name limit 100"
      )
    ]);
    response.json({
      summary:summary.rows[0],
      customers:customers.rows,
      recentOrders:orders.rows,
      lowStock:lowStock.rows
    });
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.get("/api/admin/feedback",authenticate,requireAdmin,async (_request,response) => {
  try {
    const {rows} = await pool.query(
      `select f.id,f.rating,f.message,f.created_at,u.email,
        coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),u.email) as customer_name
       from public.feedback f left join auth.users u on u.id=f.user_id
       order by f.created_at desc limit 200`
    );
    response.json(rows);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.get("/api/admin/transactions",authenticate,requireAdmin,async (_request,response) => {
  try {
    const {rows} = await pool.query(
      `select pt.id,pt.order_id,pt.amount_php,pt.payment_method,pt.status,pt.created_at,pt.updated_at,
        o.tracking_number,
        coalesce(nullif(o.customer_name,''),nullif(p.full_name,''),nullif(u.raw_user_meta_data->>'full_name',''),u.email) as customer_name,
        u.email,
        coalesce(nullif(o.customer_phone,''),nullif(p.phone,''),nullif(u.phone,''),'—') as customer_phone,
        coalesce(nullif(o.delivery_address,''),nullif(p.delivery_address,''),'Not provided') as delivery_address
       from public.payment_transactions pt
       join public.orders o on o.id=pt.order_id
       join auth.users u on u.id=pt.user_id
       join public.profiles p on p.user_id=u.id
       order by pt.created_at desc limit 500`
    );
    response.json(rows);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.patch("/api/admin/transactions/:id/status",authenticate,requireAdmin,async (request,response) => {
  const status = request.body?.status;
  if (!paymentStatuses.has(status)) {
    return response.status(400).json({error:"Choose a valid transaction status."});
  }
  try {
    const {rows} = await pool.query(
      `update public.payment_transactions set status=$1,updated_at=now()
       where id=$2 returning id,order_id,status,updated_at`,
      [status,request.params.id]
    );
    if (!rows[0]) return response.status(404).json({error:"Payment transaction was not found."});
    response.json(rows[0]);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.post("/api/admin/users/role",authenticate,requireAdmin,async (request,response) => {
  const email = typeof request.body?.email === "string" ? request.body.email.trim() : "";
  const role = request.body?.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["admin","customer"].includes(role)) {
    return response.status(400).json({error:"Enter a valid account email and choose admin or customer access."});
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const account = await client.query(
      "select id,email from auth.users where lower(email) = lower($1) limit 1 for update",
      [email]
    );
    if (!account.rows[0]) {
      await client.query("rollback");
      return response.status(404).json({error:"No Supabase account exists for that email. The user must create an account first."});
    }
    if (account.rows[0].id === request.adminId && role !== "admin") {
      await client.query("rollback");
      return response.status(400).json({error:"You cannot remove your own administrator access."});
    }
    const profile = await client.query(
      `insert into public.profiles (user_id,role) values ($1,$2)
       on conflict (user_id) do update set role = excluded.role
       returning user_id,role`,
      [account.rows[0].id,role]
    );
    await client.query("commit");
    response.json({email:account.rows[0].email,user_id:profile.rows[0].user_id,role:profile.rows[0].role});
  } catch (error) {
    await client.query("rollback");
    reportDatabaseError(response,error);
  } finally {
    client.release();
  }
});

app.get("/api/admin/products",authenticate,requireAdmin,async (_request,response) => {
  try {
    const {rows} = await pool.query(
      "select id,name,brand,category,price_php,stock,image_url,active,created_at from public.products order by category,name"
    );
    response.json(rows);
  } catch (error) {
    reportDatabaseError(response,error);
  }
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

app.post("/api/admin/products",authenticate,requireAdmin,async (request,response) => {
  if (!validateProduct(request.body)) return response.status(400).json({error:"Product fields are invalid."});
  try {
    const {rows} = await pool.query(
      `insert into public.products (id,name,brand,category,price_php,stock,image_url,active)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [request.body.id,request.body.name.trim(),request.body.brand,request.body.category,
        request.body.price_php,request.body.stock,request.body.image_url,request.body.active ?? true]
    );
    response.status(201).json(rows[0]);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.patch("/api/admin/products/:id",authenticate,requireAdmin,async (request,response) => {
  if (!validateProduct({...request.body,id:request.params.id})) return response.status(400).json({error:"Product fields are invalid."});
  try {
    const {rows} = await pool.query(
      `update public.products set name=$2,brand=$3,category=$4,price_php=$5,stock=$6,image_url=$7,active=$8
       where id=$1 returning *`,
      [request.params.id,request.body.name.trim(),request.body.brand,request.body.category,
        request.body.price_php,request.body.stock,request.body.image_url,request.body.active ?? true]
    );
    if (!rows[0]) return response.status(404).json({error:"The requested product was not found."});
    response.json(rows[0]);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.get("/api/admin/orders",authenticate,requireAdmin,async (_request,response) => {
  try {
    const {rows} = await pool.query(
      `select o.id,o.user_id,o.tracking_number,o.status,o.payment_method,o.total_php,o.origin,o.created_at,
        coalesce((select json_agg(json_build_object(
          'product_name',i.product_name,'quantity',i.quantity,'configuration',i.configuration
        ) order by i.id) from public.order_items i where i.order_id = o.id),'[]'::json) as order_items,
        coalesce((select json_agg(json_build_object(
          'status',t.status,'location',t.location,'description',t.description,'occurred_at',t.occurred_at
        ) order by t.occurred_at desc) from public.tracking_events t where t.order_id = o.id),'[]'::json) as tracking_events,
        coalesce((select json_build_object(
          'status',p.status,'provider',p.provider,'provider_transaction_id',p.provider_transaction_id,
          'amount_php',p.amount_php,'payment_method',p.payment_method
        ) from public.payment_transactions p where p.order_id = o.id),'{}'::json) as payment_transaction
       from public.orders o order by o.created_at desc`
    );
    response.json(rows);
  } catch (error) {
    reportDatabaseError(response,error);
  }
});

app.post("/api/admin/orders/:id/tracking",authenticate,requireAdmin,async (request,response) => {
  const {status,location,description} = request.body ?? {};
  if (!orderStatuses.has(status) || typeof location !== "string" || !location.trim()
    || location.length > 200 || typeof description !== "string" || !description.trim() || description.length > 500) {
    return response.status(400).json({error:"Tracking status, location, and update note are required."});
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    const order = await client.query("update public.orders set status=$1 where id=$2 returning id",[status,request.params.id]);
    if (!order.rows[0]) {
      await client.query("rollback");
      return response.status(404).json({error:"The requested order was not found."});
    }
    const event = await client.query(
      `insert into public.tracking_events (order_id,status,location,description)
       values ($1,$2,$3,$4) returning id,order_id,status,location,description,occurred_at`,
      [request.params.id,status,location.trim(),description.trim()]
    );
    await client.query("commit");
    response.json(event.rows[0]);
  } catch (error) {
    await client.query("rollback");
    reportDatabaseError(response,error);
  } finally {
    client.release();
  }
});

app.use("/api",(_request,response) => response.status(404).json({error:"API route not found."}));
app.use(["/server","/supabase","/node_modules"],(_request,response) => response.sendStatus(404));
app.use(express.static(root,{extensions:["html"]}));
app.get("/{*path}",(_request,response) => response.sendFile(path.join(root,"index.html")));

const isDirectExecution = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isDirectExecution) app.listen(port,() => console.log(`Caday Badminton is running at http://localhost:${port}`));

export default app;
