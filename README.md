# Caday Badminton

A desktop-first badminton gear storefront with brand/category filters, a racket setup customizer, inventory-aware cart, Supabase authentication, order tracking, an Express API, and a private admin dashboard.

## Brand assets and product photos

The five brand selectors use locally stored SVG brand marks for catalog presentation; they are not proof of product authenticity. Product cards link to the image source and identify the pictured product. All 75 entries currently use product-photo references matched to their displayed model: fifteen Yonex, fifteen Victor, fifteen Li-Ning, fifteen Babolat, and fifteen Kawasaki products. The former Li-Ning A+90 entry has been renamed to A+300 to match the verified photo, so the sample catalog contains two A+300 cards. Kawasaki photos are hosted by Kawasaki Sport Europe, a specialist retailer, rather than the manufacturer. Product prices and stock are sample data. Confirm product identity, supplier authorization, image rights, and prices before accepting real orders.

## Supabase and local setup

1. Install Node.js 20 or newer.
2. From the project folder, run `npm install`.
3. In the Supabase SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql). It seeds 75 sample products, with 15 in each of the five brand collections.
4. Copy `.env.example` to `.env`. Fill in the project URL and public anon/publishable key. Put the **service-role key only in this server-side `.env`**; never put it in browser code or commit it.
5. In Supabase Auth URL configuration, allow `http://localhost:3000/**` and set the site URL to `http://localhost:3000`.
6. Create an account in the storefront, then promote that account to admin in the SQL editor:

   ```sql
   update public.profiles
   set role = 'admin'
   where user_id = (
     select id from auth.users where email = 'your-admin-email@example.com'
   );
   ```

7. Run `npm start` and open `http://localhost:3000`. The admin area is at `http://localhost:3000/admin.html`.

The storefront reads active products from Supabase; checkout calls the transactional `place_order` function, which locks inventory rows and writes the order, line items, stock changes, and initial tracking event in one database transaction. Customers must sign in to place and track orders. Supabase Auth email confirmation and password recovery require the allowed redirect URLs to be configured in the project.

The admin API checks the signed-in user and `profiles.role` before privileged product or tracking updates. The service-role secret is used only by the Express server. Create admin accounts through Supabase Auth and promote them with the SQL above; never expose a service-role key to the browser.

## Payment and shipping notes

The selected payment method is currently only an order preference. This project does not collect card data or charge money. Integrate a payment provider with server-side webhooks before treating checkout as paid. Tracking events are manually entered by an admin; live carrier scans require a carrier API integration.

The browser Supabase SDK is loaded from jsDelivr. For offline or production deployments, bundle and pin the SDK through your build/dependency workflow instead of relying on the CDN.
