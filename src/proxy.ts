import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except the admin area, API routes, static files and media.
  matcher: ["/((?!admin|api|_next|_vercel|media|.*\\..*).*)"],
};
