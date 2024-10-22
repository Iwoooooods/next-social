import { validateRequest } from "@/auth";
import streamSeverClient from "@/lib/stream";

export async function GET() {
  const { user } = await validateRequest();

  try {
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expirationAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamSeverClient.createToken(
      user.id,
      expirationAt,
      issuedAt,
    );

    return Response.json({ token });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
