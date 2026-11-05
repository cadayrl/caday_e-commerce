create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null check (brand in ('Yonex', 'Victor', 'Li-Ning', 'Babolat', 'Kawasaki')),
  category text not null check (category in ('Rackets', 'Shuttlecocks', 'Shoes', 'Strings', 'Apparel', 'Accessories')),
  price_php integer not null check (price_php > 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products add column if not exists brand text not null default 'Yonex';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_brand_supported_check'
  ) then
    alter table public.products
      add constraint products_brand_supported_check
      check (brand in ('Yonex', 'Victor', 'Li-Ning', 'Babolat', 'Kawasaki'));
  end if;
end;
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracking_number text not null unique,
  status text not null default 'processing'
    check (status in ('processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method text not null
    check (payment_method in ('card', 'paypal', 'cash')),
  total_php integer not null check (total_php > 0),
  origin text not null default 'Pinamaloy, Don Carlos, Bukidnon',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,
  unit_price_php integer not null check (unit_price_php > 0),
  quantity integer not null check (quantity > 0),
  configuration jsonb not null default '{}'::jsonb
);
alter table public.order_items add column if not exists configuration jsonb not null default '{}'::jsonb;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

grant select on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

update public.products set active = false where id like 'bad-%';

create table if not exists public.tracking_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  location text not null,
  description text not null,
  occurred_at timestamptz not null default now()
);

insert into public.products (id, name, brand, category, price_php, stock, image_url) values
  ('yonex-racket-01', 'Yonex ASTROX 77 PRO', 'Yonex', 'Rackets', 8990, 50, 'generated-artwork:yonex-racket-01'),
  ('yonex-racket-02', 'Yonex NANOFLARE 700 TOUR', 'Yonex', 'Rackets', 8290, 57, 'generated-artwork:yonex-racket-02'),
  ('yonex-shuttle-03', 'Yonex Aerosensa 10 Feather Shuttles · 12', 'Yonex', 'Shuttlecocks', 1190, 64, 'generated-artwork:yonex-shuttle-03'),
  ('yonex-shoe-04', 'Yonex POWER CUSHION 88 DIAL UNISEX', 'Yonex', 'Shoes', 5890, 71, 'generated-artwork:yonex-shoe-04'),
  ('yonex-spool-05', 'Yonex BG65 Titanium String · 10 m', 'Yonex', 'Strings', 350, 78, 'generated-artwork:yonex-spool-05'),
  ('yonex-spool-06', 'Yonex AEROBITE BOOST String Set · 10.5 m', 'Yonex', 'Strings', 3290, 85, 'generated-artwork:yonex-spool-06'),
  ('yonex-jersey-07', 'Yonex CREW NECK SHIRT · 10716', 'Yonex', 'Apparel', 1490, 92, 'generated-artwork:yonex-jersey-07'),
  ('yonex-shorts-08', 'Yonex KNIT SHORTS · 15242', 'Yonex', 'Apparel', 1190, 99, 'generated-artwork:yonex-shorts-08'),
  ('yonex-bag-09', 'Yonex Pro Racquet Bag 6 · BAG92426', 'Yonex', 'Accessories', 4290, 55, 'generated-artwork:yonex-bag-09'),
  ('yonex-grip-10', 'Yonex EXCEL CORE GRIP · AC126', 'Yonex', 'Accessories', 390, 62, 'generated-artwork:yonex-grip-10'),
  ('yonex-shuttle-11', 'Yonex Mavis 350 Nylon Shuttles · 6', 'Yonex', 'Shuttlecocks', 690, 69, 'generated-artwork:yonex-shuttle-11'),
  ('yonex-shoe-12', 'Yonex POWER CUSHION ECLIPSION 3 MEN', 'Yonex', 'Shoes', 7190, 76, 'generated-artwork:yonex-shoe-12'),
  ('yonex-jersey-13', 'Yonex CREW NECK SHIRT · 20948', 'Yonex', 'Apparel', 1890, 83, 'generated-artwork:yonex-jersey-13'),
  ('yonex-bag-14', 'Yonex AC541 Soft Racket Cover', 'Yonex', 'Accessories', 890, 90, 'generated-artwork:yonex-bag-14'),
  ('yonex-grip-15', 'Yonex SYNTHETIC LEATHER EXCEL PRO GRIP · AC128', 'Yonex', 'Accessories', 450, 97, 'generated-artwork:yonex-grip-15'),
  ('victor-racket-01', 'Victor THRUSTER RYUGA III CQ', 'Victor', 'Rackets', 7790, 63, 'generated-artwork:victor-racket-01'),
  ('victor-racket-02', 'Victor ARS-100X ULTRA Q', 'Victor', 'Rackets', 8190, 70, 'generated-artwork:victor-racket-02'),
  ('victor-shuttle-03', 'Victor Master Ace Feather Shuttles · 12', 'Victor', 'Shuttlecocks', 1290, 77, 'generated-artwork:victor-shuttle-03'),
  ('victor-shoe-04', 'Victor P9200cXLTD X Shoes', 'Victor', 'Shoes', 5490, 84, 'generated-artwork:victor-shoe-04'),
  ('victor-spool-05', 'Victor VBS-66N Control String · 10 m', 'Victor', 'Strings', 390, 91, 'generated-artwork:victor-spool-05'),
  ('victor-spool-06', 'Victor VBS-70 RL String Reel · 200 m', 'Victor', 'Strings', 2990, 98, 'generated-artwork:victor-spool-06'),
  ('victor-jersey-07', 'Victor x Street Fighter Knitted T-shirt T-2601STF', 'Victor', 'Apparel', 1290, 54, 'generated-artwork:victor-jersey-07'),
  ('victor-shorts-08', 'Victor Zswing Collection 2.0 Knitted Shorts R-602ZSW', 'Victor', 'Apparel', 990, 61, 'generated-artwork:victor-shorts-08'),
  ('victor-bag-09', 'Victor x Street Fighter Rectangular Racket Bag BR5659STFB', 'Victor', 'Accessories', 3190, 68, 'generated-artwork:victor-bag-09'),
  ('victor-grip-10', 'Victor GR262 Grip Wrap · 3 Pack', 'Victor', 'Accessories', 290, 75, 'generated-artwork:victor-grip-10'),
  ('victor-shuttle-11', 'Victor x Street Fighter NCS Max Synthetic Shuttlecock', 'Victor', 'Shuttlecocks', 590, 81, 'generated-artwork:victor-shuttle-11'),
  ('victor-shoe-12', 'Victor P9200cX A/DX Shoes', 'Victor', 'Shoes', 6290, 88, 'generated-artwork:victor-shoe-12'),
  ('victor-jersey-13', 'Victor BWF World Junior Championships Knitted T-shirt', 'Victor', 'Apparel', 1790, 95, 'generated-artwork:victor-jersey-13'),
  ('victor-bag-14', 'Victor x Street Fighter Rectangular Racket Bag BR5637STFJ', 'Victor', 'Accessories', 790, 51, 'generated-artwork:victor-bag-14'),
  ('victor-grip-15', 'Victor x Butterbear Overgrip GR221BTB', 'Victor', 'Accessories', 350, 58, 'generated-artwork:victor-grip-15'),
  ('li-ning-racket-01', 'Li-Ning Axforce 80 Power 4U', 'Li-Ning', 'Rackets', 9590, 76, 'generated-artwork:li-ning-racket-01'),
  ('li-ning-racket-02', 'Li-Ning Windstorm 72 Speed · 72 g', 'Li-Ning', 'Rackets', 7290, 83, 'generated-artwork:li-ning-racket-02'),
  ('li-ning-shuttle-03', 'Li-Ning A+300 Feather Shuttles · 12', 'Li-Ning', 'Shuttlecocks', 1290, 90, 'generated-artwork:li-ning-shuttle-03'),
  ('li-ning-shoe-04', 'Li-Ning Hypersonic III Shoes', 'Li-Ning', 'Shoes', 4290, 97, 'generated-artwork:li-ning-shoe-04'),
  ('li-ning-spool-05', 'Li-Ning No.1 Boost String · 10 m', 'Li-Ning', 'Strings', 650, 52, 'generated-artwork:li-ning-spool-05'),
  ('li-ning-spool-06', 'Li-Ning No. 5 String · 10 m', 'Li-Ning', 'Strings', 2790, 59, 'generated-artwork:li-ning-spool-06'),
  ('li-ning-jersey-07', 'Li-Ning Slash Round Neck T-shirt', 'Li-Ning', 'Apparel', 1590, 66, 'generated-artwork:li-ning-jersey-07'),
  ('li-ning-shorts-08', 'Li-Ning Men''s Shorts', 'Li-Ning', 'Apparel', 1190, 73, 'generated-artwork:li-ning-shorts-08'),
  ('li-ning-bag-09', 'Li-Ning Badminton Racket Bag Limited · 9 in 1', 'Li-Ning', 'Accessories', 3690, 80, 'generated-artwork:li-ning-bag-09'),
  ('li-ning-grip-10', 'Li-Ning Overgrip Glue · Box of 10', 'Li-Ning', 'Accessories', 320, 87, 'generated-artwork:li-ning-grip-10'),
  ('li-ning-shuttle-11', 'Li-Ning A+300 Feather Shuttles · 12', 'Li-Ning', 'Shuttlecocks', 550, 95, 'generated-artwork:li-ning-shuttle-11'),
  ('li-ning-shoe-12', 'Li-Ning Aero Lite II Shoes', 'Li-Ning', 'Shoes', 4990, 52, 'generated-artwork:li-ning-shoe-12'),
  ('li-ning-jersey-13', 'Li-Ning AAYP071 Sudirman Cup Edition T-shirt', 'Li-Ning', 'Apparel', 1890, 59, 'generated-artwork:li-ning-jersey-13'),
  ('li-ning-bag-14', 'Li-Ning Beijing-Tokyo Limited Racket Bag · 9 in 1', 'Li-Ning', 'Accessories', 850, 66, 'generated-artwork:li-ning-bag-14'),
  ('li-ning-grip-15', 'Li-Ning AXJQ008 Perforated Overgrip · Box of 10', 'Li-Ning', 'Accessories', 390, 73, 'generated-artwork:li-ning-grip-15'),
  ('babolat-racket-01', 'Babolat X-Feel Origin Strung', 'Babolat', 'Rackets', 5890, 89, 'generated-artwork:babolat-racket-01'),
  ('babolat-racket-02', 'Babolat Satelite Rise Strung', 'Babolat', 'Rackets', 6290, 96, 'generated-artwork:babolat-racket-02'),
  ('babolat-shuttle-03', 'Babolat Hybrid Challenge Feather Shuttles · 12', 'Babolat', 'Shuttlecocks', 1090, 52, 'generated-artwork:babolat-shuttle-03'),
  ('babolat-shoe-04', 'Babolat Shadow Tour 5 Men Shoes', 'Babolat', 'Shoes', 4990, 59, 'generated-artwork:babolat-shoe-04'),
  ('babolat-spool-05', 'Babolat I Feel 68 String · 10.2 m', 'Babolat', 'Strings', 390, 66, 'generated-artwork:babolat-spool-05'),
  ('babolat-spool-06', 'Babolat iFeel 70 Durability Reel · 200 m', 'Babolat', 'Strings', 2690, 73, 'generated-artwork:babolat-spool-06'),
  ('babolat-jersey-07', 'Babolat Exercise Graphic Tee Men', 'Babolat', 'Apparel', 1390, 80, 'generated-artwork:babolat-jersey-07'),
  ('babolat-shorts-08', 'Babolat Play Short Men', 'Babolat', 'Apparel', 990, 87, 'generated-artwork:babolat-shorts-08'),
  ('babolat-bag-09', 'Babolat Backrack 3 Bag', 'Babolat', 'Accessories', 3490, 94, 'generated-artwork:babolat-bag-09'),
  ('babolat-grip-10', 'Babolat Grip Sensation X2', 'Babolat', 'Accessories', 350, 50, 'generated-artwork:babolat-grip-10'),
  ('babolat-shuttle-11', 'Babolat Nylon Tournament Shuttlecock', 'Babolat', 'Shuttlecocks', 620, 57, 'generated-artwork:babolat-shuttle-11'),
  ('babolat-shoe-12', 'Babolat Shadow Spirit 2 Men Shoes', 'Babolat', 'Shoes', 4290, 64, 'generated-artwork:babolat-shoe-12'),
  ('babolat-jersey-13', 'Babolat Play Crew Neck Tee Men', 'Babolat', 'Apparel', 1690, 71, 'generated-artwork:babolat-jersey-13'),
  ('babolat-bag-14', 'Babolat Cross Pro Badminton Bag', 'Babolat', 'Accessories', 790, 78, 'generated-artwork:babolat-bag-14'),
  ('babolat-grip-15', 'Babolat Syntec Pro Grip', 'Babolat', 'Accessories', 420, 85, 'generated-artwork:babolat-grip-15'),
  ('kawasaki-racket-01', 'Kawasaki SPIDER KING 306 Racket', 'Kawasaki', 'Rackets', 5290, 51, 'generated-artwork:kawasaki-racket-01'),
  ('kawasaki-racket-02', 'Kawasaki MASTER MAO 20 Purple Racket', 'Kawasaki', 'Rackets', 4790, 58, 'generated-artwork:kawasaki-racket-02'),
  ('kawasaki-shuttle-03', 'Kawasaki King 8E Feather Shuttles · 12', 'Kawasaki', 'Shuttlecocks', 990, 65, 'generated-artwork:kawasaki-shuttle-03'),
  ('kawasaki-shoe-04', 'Kawasaki K-565 JuFeng Shoes', 'Kawasaki', 'Shoes', 3590, 72, 'generated-artwork:kawasaki-shoe-04'),
  ('kawasaki-spool-05', 'Kawasaki KSB-65 Ti String · 10 m', 'Kawasaki', 'Strings', 320, 79, 'generated-artwork:kawasaki-spool-05'),
  ('kawasaki-spool-06', 'Kawasaki KSB-68 String Reel · 200 m', 'Kawasaki', 'Strings', 2390, 86, 'generated-artwork:kawasaki-spool-06'),
  ('kawasaki-jersey-07', 'Kawasaki K1C02-C1010 T-shirt', 'Kawasaki', 'Apparel', 1190, 93, 'generated-artwork:kawasaki-jersey-07'),
  ('kawasaki-shorts-08', 'Kawasaki K1C10-A3693-1 Shorts', 'Kawasaki', 'Apparel', 890, 100, 'generated-artwork:kawasaki-shorts-08'),
  ('kawasaki-bag-09', 'Kawasaki K1G00-C8903 Racket Bag', 'Kawasaki', 'Accessories', 2890, 56, 'generated-artwork:kawasaki-bag-09'),
  ('kawasaki-grip-10', 'Kawasaki K-001 Racket Grips · 5 Pack', 'Kawasaki', 'Accessories', 250, 63, 'generated-artwork:kawasaki-grip-10'),
  ('kawasaki-shuttle-11', 'Kawasaki N350 Nylon Shuttles · 6', 'Kawasaki', 'Shuttlecocks', 490, 70, 'generated-artwork:kawasaki-shuttle-11'),
  ('kawasaki-shoe-12', 'Kawasaki K1B30-C32020 Badminton Shoes', 'Kawasaki', 'Shoes', 4290, 77, 'generated-artwork:kawasaki-shoe-12'),
  ('kawasaki-jersey-13', 'Kawasaki K1C02-C1031 T-shirt', 'Kawasaki', 'Apparel', 1590, 84, 'generated-artwork:kawasaki-jersey-13'),
  ('kawasaki-bag-14', 'Kawasaki K1G00-C8905 Racket Bag', 'Kawasaki', 'Accessories', 690, 91, 'generated-artwork:kawasaki-bag-14'),
  ('kawasaki-grip-15', 'Kawasaki X5II Racket Grips · 5 Pack', 'Kawasaki', 'Accessories', 290, 98, 'generated-artwork:kawasaki-grip-15')
on conflict (id) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  price_php = excluded.price_php,
  image_url = excluded.image_url;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tracking_events enable row level security;

drop policy if exists "Anyone can view active badminton products" on public.products;
create policy "Anyone can view active badminton products"
  on public.products for select
  using (active = true);

drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Customers can view items in their own orders" on public.order_items;
create policy "Customers can view items in their own orders"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

drop policy if exists "Customers can view tracking for their own orders" on public.tracking_events;
create policy "Customers can view tracking for their own orders"
  on public.tracking_events for select
  using (exists (
    select 1 from public.orders
    where orders.id = tracking_events.order_id and orders.user_id = auth.uid()
  ));

grant select on public.products to anon, authenticated;
grant select on public.orders, public.order_items, public.tracking_events to authenticated;
grant all on public.products, public.orders, public.order_items, public.tracking_events, public.profiles to service_role;
grant usage, select on all sequences in schema public to service_role;

create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text
)
returns table (order_id uuid, tracking_number text, total_php integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_tracking_number text;
  v_item record;
  v_price integer;
  v_stock integer;
  v_product_name text;
  v_product_brand text;
  v_configuration jsonb;
  v_stringing boolean;
  v_total integer := 0;
  v_user_id uuid := auth.uid();
begin
  v_tracking_number := 'CAD-' || upper(substr(replace(v_order_id::text, '-', ''), 1, 8));

  if v_user_id is null then
    raise exception 'Sign in is required to place an order';
  end if;

  if p_payment_method is null or p_payment_method not in ('card', 'paypal', 'cash') then
    raise exception 'Unsupported payment method';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'The order must contain at least one item';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id text, quantity integer, configuration jsonb)
    where item.product_id is null or btrim(item.product_id) = ''
      or item.quantity is null or item.quantity < 1
      or (coalesce(item.configuration, '{}'::jsonb) ? 'tension'
        and (item.configuration->>'tension') !~ '^(18|19|20|21|22|23|24|25|26|27|28|29|30)$')
      or (coalesce(item.configuration, '{}'::jsonb) ? 'grip'
        and (item.configuration->>'grip') not in ('G4','G5','G6'))
      or (coalesce(item.configuration, '{}'::jsonb) ? 'brand'
        and (item.configuration->>'brand') not in ('Yonex','Victor','Li-Ning','Babolat','Kawasaki'))
  ) then
    raise exception 'Invalid product or quantity';
  end if;

  for v_item in
    select item.product_id, item.configuration, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, quantity integer, configuration jsonb)
    group by item.product_id, item.configuration
    order by item.product_id, item.configuration
  loop
    if v_item.quantity is null or v_item.quantity < 1 then
      raise exception 'Invalid product quantity';
    end if;

    select product.price_php, product.stock, product.name, product.brand
    into v_price, v_stock, v_product_name, v_product_brand
    from public.products as product
    where product.id = v_item.product_id and product.active = true
    for update;

    if not found then
      raise exception 'Product % is unavailable', v_item.product_id;
    end if;

    if v_item.quantity > v_stock then
      raise exception 'Insufficient stock for product %', v_item.product_id;
    end if;

    v_configuration := coalesce(v_item.configuration, '{}'::jsonb);
    v_stringing := coalesce((v_configuration->>'stringing_service')::boolean, false);
    if v_configuration ? 'brand' and v_configuration->>'brand' <> v_product_brand then
      raise exception 'Racket brand does not match the selected product';
    end if;
    if v_stringing and (select category from public.products where id = v_item.product_id) <> 'Rackets' then
      raise exception 'Stringing service is only available for rackets';
    end if;

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;

    v_total := v_total + (v_price + case when v_stringing then 500 else 0 end) * v_item.quantity;
  end loop;

  insert into public.orders (id, user_id, tracking_number, payment_method, total_php)
  values (v_order_id, v_user_id, v_tracking_number, p_payment_method, v_total);

  for v_item in
    select item.product_id, item.configuration, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id text, quantity integer, configuration jsonb)
    group by item.product_id, item.configuration
    order by item.product_id, item.configuration
  loop
    select product.price_php, product.name
    into v_price, v_product_name
    from public.products as product
    where product.id = v_item.product_id;

    v_configuration := coalesce(v_item.configuration, '{}'::jsonb);
    v_stringing := coalesce((v_configuration->>'stringing_service')::boolean, false);
    insert into public.order_items (order_id, product_id, product_name, unit_price_php, quantity, configuration)
    values (v_order_id, v_item.product_id, v_product_name, v_price + case when v_stringing then 500 else 0 end, v_item.quantity, v_configuration);
  end loop;

  insert into public.tracking_events (order_id, status, location, description)
  values (
    v_order_id,
    'processing',
    'Pinamaloy, Don Carlos, Bukidnon',
    'Order received by Caday Badminton. Shipment updates will appear after dispatch.'
  );

  return query select v_order_id, v_tracking_number, v_total;
end;
$$;

revoke all on function public.place_order(jsonb, text) from public;
grant execute on function public.place_order(jsonb, text) to authenticated;

create or replace function public.admin_add_tracking_event(
  p_admin_id uuid,
  p_order_id uuid,
  p_status text,
  p_location text,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not exists (
    select 1 from public.profiles
    where user_id = p_admin_id and role = 'admin'
  ) then
    raise exception 'Administrator access is required';
  end if;

  if p_status is null or p_status not in ('processing','shipped','in_transit','out_for_delivery','delivered','cancelled')
    or length(btrim(p_location)) = 0 or length(btrim(p_description)) = 0 then
    raise exception 'Invalid tracking event';
  end if;

  update public.orders set status = p_status where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;

  insert into public.tracking_events (order_id,status,location,description)
  values (p_order_id,p_status,btrim(p_location),btrim(p_description))
  returning jsonb_build_object(
    'id', id,
    'order_id', order_id,
    'status', status,
    'location', location,
    'description', description,
    'occurred_at', occurred_at
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_add_tracking_event(uuid, uuid, text, text, text) from public;
grant execute on function public.admin_add_tracking_event(uuid, uuid, text, text, text) to service_role;
