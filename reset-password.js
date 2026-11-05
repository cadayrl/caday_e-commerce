const form = document.querySelector("#resetPasswordForm");
const message = document.querySelector("#resetMessage");

async function createClient() {
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("The shop server is not running.");
  const config = await response.json();
  if (!window.supabase?.createClient || !config.supabaseUrl || !config.anonKey) {
    throw new Error("Supabase configuration is missing.");
  }
  return window.supabase.createClient(config.supabaseUrl,config.anonKey);
}

form.addEventListener("submit",async (event) => {
  event.preventDefault();
  message.textContent = "";
  try {
    const client = await createClient();
    const {error} = await client.auth.updateUser({password:document.querySelector("#newPassword").value});
    if (error) throw error;
    form.reset();
    message.textContent = "Password updated. You can now sign in.";
  } catch (error) {
    message.textContent = error.message;
  }
});
