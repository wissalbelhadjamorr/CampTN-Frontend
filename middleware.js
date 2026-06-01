import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

let defaultLocale = "en";
let locales = ["bn", "en", "ar"];

function getLocale(request) {
  const acceptedLanguage = request.headers.get("accept-language") ?? undefined;
  let headers = { "accept-language": acceptedLanguage };
  let languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

const authPages = ["/login", "/register"];

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const currentLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const pathWithoutLocale = currentLocale
    ? pathname.slice(`/${currentLocale}`.length) || "/"
    : pathname;

  const token = request.cookies.get("token")?.value;

  if (token && authPages.some((page) => pathWithoutLocale.startsWith(page))) {
    const locale = currentLocale ?? getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ["/((?!api|assets|docs|.*\\..*|_next).*)"],
};