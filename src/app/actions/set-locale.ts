"use server";

import { cookies } from "next/headers";
import { isValidLocale, type Locale } from "@/i18n/request";

export async function setLocale(locale: Locale) {
  if (!isValidLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
