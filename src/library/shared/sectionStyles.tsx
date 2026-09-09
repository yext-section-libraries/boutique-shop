import * as React from "react";
import {
  getThemeColorCssValue,
  MaybeRTF,
  type MaybeRTFProps,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

export const resolveExplicitColor = (
  color: string | ThemeColor | undefined,
): React.CSSProperties | undefined => {
  const resolvedColor = getThemeColorCssValue(color);
  return resolvedColor ? { color: resolvedColor } : undefined;
};

export const getTextStyle = (
  styles: StyledTextValue,
  fontColor?: string | ThemeColor,
): React.CSSProperties => ({
  color: getThemeColorCssValue(fontColor),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    return value;
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;
  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

export const isRichTextEmpty = (value: unknown): boolean => {
  if (!value) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    return typeof html !== "string" || html.trim() === "";
  }
  return false;
};

export const resolveThemeColor = (
  color: ThemeColor | undefined,
  fallback: string,
): string => {
  if (!color?.selectedColor) {
    return fallback;
  }
  const selected = color.selectedColor;
  if (selected.startsWith("palette-") && selected.endsWith("-light")) {
    return `hsl(from var(--colors-${selected.replace(/-light$/, "")}) h s 98)`;
  }
  if (selected.startsWith("palette-") && selected.endsWith("-dark")) {
    return `hsl(from var(--colors-${selected.replace(/-dark$/, "")}) h s 20)`;
  }
  return selected.startsWith("palette-")
    ? `var(--colors-${selected})`
    : selected;
};

export const resolveFontColor = (
  fontColor: string | ThemeColor | undefined,
  fallback: string,
): string => {
  if (!fontColor) {
    return fallback;
  }
  return typeof fontColor === "string"
    ? fontColor
    : resolveThemeColor(fontColor, fallback);
};

type PostalAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
};

export const buildDirectionsUrl = (
  address: PostalAddress | undefined,
): string | undefined => {
  if (!address) {
    return undefined;
  }
  const query = [
    address.line1,
    address.line2,
    address.city,
    address.region,
    address.postalCode,
    address.countryCode,
  ]
    .filter(Boolean)
    .join(", ");
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : undefined;
};
