import { CountryCode } from "@/checkout-storefront/graphql";
import { UrlChangeHandlerArgs, useUrlChange } from "@/checkout-storefront/hooks/useUrlChange";
import { DEFAULT_LOCALE, Locale } from "@/checkout-storefront/lib/regions";
import { getParsedLocaleData, getQueryParams } from "@/checkout-storefront/lib/utils";
import { useState } from "react";

import En from "@/checkout-storefront/compiled-locales/en-US.json";
import Minion from "@/checkout-storefront/compiled-locales/minion.json";

const localeToMessages = {
  "en-US": En,
  minion: Minion,
} as const;

interface UseLocale {
  locale: Locale;
  countryCode: CountryCode;
  messages: typeof localeToMessages[keyof typeof localeToMessages];
}

export const useLocale = (): UseLocale => {
  const { locale, countryCode } = getParsedLocaleData(getQueryParams().locale);

  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [currentCountryCode, setCurrentCountryCode] = useState<CountryCode>(countryCode);

  const messages =
    currentLocale in localeToMessages
      ? localeToMessages[currentLocale as keyof typeof localeToMessages]
      : localeToMessages[DEFAULT_LOCALE];

  if (!messages) {
    console.warn(`Missing messages for locale: ${currentLocale}`);
  }

  const handleChange = ({ queryParams }: UrlChangeHandlerArgs) => {
    const newQuery = getParsedLocaleData(queryParams.locale);
    setCurrentLocale(newQuery.locale);
    setCurrentCountryCode(newQuery.countryCode);
  };

  useUrlChange(handleChange);

  return { locale: currentLocale, countryCode: currentCountryCode, messages };
};
