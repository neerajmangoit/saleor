import { createClient, Provider as UrqlProvider, ClientOptions } from "urql";
import { ErrorBoundary } from "react-error-boundary";
import { createFetch, createSaleorClient, SaleorProvider } from "@saleor/sdk";
import { IntlProvider } from "react-intl";

import { Checkout, CheckoutSkeleton } from "@/checkout-storefront/views/Checkout";
import { DEFAULT_LOCALE, getCurrentLocale, Locale } from "@/checkout-storefront/lib/regions";
import { getQueryParams } from "@/checkout-storefront/lib/utils";
import { AppConfigProvider } from "@/checkout-storefront/providers/AppConfigProvider";
import {
  OrderConfirmation,
  OrderConfirmationSkeleton,
} from "@/checkout-storefront/views/OrderConfirmation";
import { PageNotFound } from "@/checkout-storefront/views/PageNotFound";
import { ToastContainer } from "react-toastify";
import { alertsContainerProps } from "../hooks/useAlerts/consts";
import { Suspense, useMemo, useState } from "react";
import { AppEnv } from "@/checkout-storefront/providers/AppConfigProvider/types";
import { UrlChangeHandlerArgs, useUrlChange } from "@/checkout-storefront/hooks/useUrlChange";

export interface RootProps {
  env: AppEnv;
}

export const Root = ({ env }: RootProps) => {
  const orderId = getQueryParams().orderId;
  const [currentLocale, setCurrentLocale] = useState<Locale>(getCurrentLocale());

  const authorizedFetch = useMemo(() => createFetch(), []);

  const client = useMemo(
    () =>
      createClient({
        url: env.apiUrl,
        suspense: true,
        requestPolicy: "cache-and-network",
        fetch: authorizedFetch as ClientOptions["fetch"],
      }),
    [authorizedFetch, env.apiUrl]
  );

  // temporarily need to use @apollo/client because saleor sdk
  // is based on apollo. to be changed
  const saleorClient = useMemo(
    () =>
      createSaleorClient({
        apiUrl: env.apiUrl,
        channel: "default-channel",
      }),
    [env.apiUrl]
  );

  const handleUrlChange = ({ queryParams: { locale } }: UrlChangeHandlerArgs) => {
    setCurrentLocale(locale);
  };

  useUrlChange(handleUrlChange);

  return (
    // @ts-ignore React 17 <-> 18 type mismatch
    <SaleorProvider client={saleorClient}>
      <IntlProvider defaultLocale={DEFAULT_LOCALE} locale={currentLocale}>
        <UrqlProvider value={client}>
          <AppConfigProvider env={env}>
            <div className="app">
              <ToastContainer {...alertsContainerProps} />
              <ErrorBoundary FallbackComponent={PageNotFound}>
                {orderId ? (
                  <Suspense fallback={<OrderConfirmationSkeleton />}>
                    <OrderConfirmation orderId={orderId} />
                  </Suspense>
                ) : (
                  <Suspense fallback={<CheckoutSkeleton />}>
                    <Checkout />
                  </Suspense>
                )}
              </ErrorBoundary>
            </div>
          </AppConfigProvider>
        </UrqlProvider>
      </IntlProvider>
    </SaleorProvider>
  );
};
