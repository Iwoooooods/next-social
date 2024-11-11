import { del } from "@vercel/blob";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get("url") as string;
    if (!urlToDelete) {
      return new Response("URL is required", { status: 400 });
    }
    await del(urlToDelete);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
