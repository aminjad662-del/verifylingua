import { NextRequest } from "next/server";
import { POST as logoutPost, GET as logoutGet } from "../logout/route";

export async function POST(req: NextRequest) {
  return logoutPost(req);
}

export async function GET(req: NextRequest) {
  return logoutGet(req);
}
