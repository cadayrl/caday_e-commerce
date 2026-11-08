import "dotenv/config";
import {createClient} from "@supabase/supabase-js";

const email = process.argv[2]?.trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Provide a valid email address: npm run admin:create -- admin@example.com");
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in the server-side .env file.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {persistSession: false, autoRefreshToken: false}
});

async function findUserByEmail(targetEmail) {
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const {data, error} = await supabase.auth.admin.listUsers({page, perPage});
    if (error) throw new Error(`Could not check existing Supabase users: ${error.message}`);
    const users = data.users ?? [];
    const match = users.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (users.length < perPage) return null;
  }
}

let user = await findUserByEmail(email);
if (user) {
  console.log(`Found existing Supabase account for ${email}.`);
} else {
  const redirectTo = process.env.ADMIN_INVITE_REDIRECT_URL;
  const {data, error} = await supabase.auth.admin.inviteUserByEmail(
    email,
    redirectTo ? {redirectTo} : undefined
  );
  if (error) throw new Error(`Could not invite ${email}: ${error.message}`);
  user = data.user;
  if (!user) throw new Error("Supabase sent no user record after creating the invitation.");
  console.log(`Sent an account invitation to ${email}.`);
}

const {error} = await supabase.from("profiles").upsert(
  {user_id: user.id, role: "admin"},
  {onConflict: "user_id"}
);
if (error) throw new Error(`Account was found, but admin access could not be granted: ${error.message}`);

console.log(`Granted admin access to ${email}. They can sign in at /admin.html after completing any email invitation or confirmation.`);
