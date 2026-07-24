import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const LOCALES = ["zh-TW", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-TW";

export function isValidLocale(v: string | undefined): v is Locale {
  return LOCALES.includes(v as Locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isValidLocale(requested) ? requested : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
