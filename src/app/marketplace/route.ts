import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function GET(req: NextRequest) {
  const search = req.nextUrl.search
  return NextResponse.redirect(new URL(`/${search}`, req.url))
}
