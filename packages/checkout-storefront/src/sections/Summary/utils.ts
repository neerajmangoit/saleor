import {
  AttributeValue,
  CheckoutLineFragment,
  LanguageCodeEnum,
  OrderLineFragment,
} from "@/checkout-storefront/graphql";
import compact from "lodash-es/compact";
import { useIntl } from "react-intl";

export const isCheckoutLine = (
  line: CheckoutLineFragment | OrderLineFragment
): line is CheckoutLineFragment => line.__typename === "CheckoutLine";

export const getThumbnailFromLine = (line: CheckoutLineFragment) =>
  line.variant.media?.find(({ type }) => type === "IMAGE") ||
  line.variant.product.media?.find(({ type }) => type === "IMAGE");

export const getSummaryLineProps = (line: OrderLineFragment | CheckoutLineFragment) =>
  isCheckoutLine(line)
    ? {
        variantName: line.variant.translation?.name || line.variant.name,
        productName: line.variant.product.translation?.name || line.variant.product.name,
        productImage: getThumbnailFromLine(line),
      }
    : {
        variantName: line.variantName,
        productName: line.productName,
        productImage: line.thumbnail,
      };

export const useSummaryLineLineAttributesText = (
  line: CheckoutLineFragment | OrderLineFragment
): string => {
  const intl = useIntl();

  return (
    compact(
      line.variant?.attributes.reduce(
        (result: string[], { values }: { values: AttributeValue[] }) => [
          ...result,
          ...values.map(({ name, dateTime, translation }) => {
            // if (translation?.name) {
            //   return translation.name;
            // }

            // if (dateTime) {
            //   return intl.formatDate(dateTime, { dateStyle: "medium" });
            // }

            return name as string;
          }),
        ],
        [] as string[]
      )
    ).join(", ") || ""
  );
};
