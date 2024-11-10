import { validateRequest } from "@/auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  //   const { user } = await validateRequest();
  //   if (!user) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  //   }
  try {
    const { searchParams } = new URL(req.url);

    const fileName = searchParams.get("fileName");
    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 },
      );
    }
    if (!req.body) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    const blob = await put(`avatar/${fileName}`, req.body, {
      access: "public",
    });
    return NextResponse.json(blob);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 },
    );
  }
}
