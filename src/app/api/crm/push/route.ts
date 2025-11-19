import { NextResponse } from "next/server";

const GOHIGHLEVEL_URL = "https://rest.gohighlevel.com/v1/leads/";

async function sendToGoHighLevel(payload: unknown) {
  const key = process.env.GOHIGHLEVEL_API_KEY;
  if (!key) return null;
  const response = await fetch(GOHIGHLEVEL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("GoHighLevel push failed");
  return response.json();
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const remote = await sendToGoHighLevel(body).catch(() => null);
    if (remote) {
      return NextResponse.json({ source: "live", remote });
    }
  } catch (error) {
    console.warn("CRM push failed", error);
  }

  return NextResponse.json({
    source: "mock",
    status: "queued",
    requested: body,
  });
}
