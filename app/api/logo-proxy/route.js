// app/api/logo-proxy/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url", { status: 400 });
  }

  try {
    // Server-to-server fetch (no browser CORS here)
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Error in logo-proxy route:", e);
    return new Response("Error fetching image", { status: 500 });
  }
}
