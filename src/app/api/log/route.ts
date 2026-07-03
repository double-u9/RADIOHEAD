
import { NextResponse } from "next/server";
import fs from "fs";
export async function POST(req: Request) {
  const body = await req.json();
  fs.writeFileSync("error_log.txt", JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}