export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handleCors();
    }

    let response;
    if (request.method === "POST" && url.pathname === "/shorten") {
      response = await handleShorten(request, env);
    } else if (request.method === "GET" && url.pathname.length > 1) {
      response = await handleRedirect(url.pathname.substring(1), env);
    } else {
      response = new Response("Not Found", { status: 404 });
    }

    return addCorsHeaders(response);
  },
};

async function handleShorten(request, env) {
  try {
    const { longUrl } = await request.json();
    if (!longUrl) {
      return new Response("Missing URL", { status: 400 });
    }

    const shortCode = Math.random().toString(36).substring(2, 8);

    // Use the correct binding name: env.DATABASE
    const stmt = env.DATABASE.prepare(
      "INSERT INTO urls (short_code, long_url) VALUES (?, ?)"
    );

    await stmt.bind(shortCode, longUrl).run();

    return new Response(
      JSON.stringify({ shortUrl: `https://bitter-mountain-1c37/${shortCode}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response("Database Error", { status: 500 });
  }
}

async function handleRedirect(shortCode, env) {
  try {
    const stmt = env.DATABASE.prepare(
      "SELECT long_url FROM urls WHERE short_code = ?"
    );

    const result = await stmt.bind(shortCode).first();

    if (!result) {
      return new Response("Not Found", { status: 404 });
    }

    return Response.redirect(result.long_url, 301);
  } catch (error) {
    return new Response("Database Error", { status: 500 });
  }
}

// Handle preflight OPTIONS requests
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Add CORS headers to responses
function addCorsHeaders(response) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return newResponse;
}