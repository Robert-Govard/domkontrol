import { NextResponse, type NextRequest } from "next/server";

/**
 * Если задан ADMIN_PASSWORD — панель УК и API заявок закрыты Basic Auth (логин admin).
 * Без пароля (демо на хакатоне) доступ открыт.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const [user, pass] = atob(header.slice(6)).split(":");
    if (user === "admin" && pass === password) return NextResponse.next();
  }
  return new NextResponse("Требуется авторизация", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="DomKontrol admin", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/tickets/:path*"],
};
