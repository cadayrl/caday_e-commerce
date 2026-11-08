export default function handler(_request, response) {
  const {SUPABASE_URL, SUPABASE_ANON_KEY} = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response.status(503).json({error: "Supabase authentication is not configured."});
  }

  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({
    supabaseUrl: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  });
}
