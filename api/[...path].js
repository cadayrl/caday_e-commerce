import app from "../server/index.js";

export default function handler(request,response) {
  const url = request.url || "/";
  if (!url.startsWith("/api/") && url !== "/api") {
    request.url = `/api${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return app(request,response);
}
