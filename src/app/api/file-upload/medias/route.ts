import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);

    const order = searchParams.get("order");
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

    const mediaId = randomUUID();
    const ext = fileName.split(".").pop();

    const resp = await fetch(
      `https://huaisen.hk.cpolar.io/api/upload/${user.id}/${mediaId}.${ext}`,
      {
        method: "POST",
        body: req.body,
        duplex: "half",
      } as RequestInit,
    );
    const fileInfo = await resp.json();
    const media = await prisma.media.create({
      data: {
        id: mediaId,
        url: fileInfo.url,
        md5: fileInfo.md5Hash,
        type: "IMAGE",
        order: order ? parseInt(order) : undefined,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 },
    );
  }
}
