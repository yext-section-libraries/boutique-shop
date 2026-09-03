import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { Address, AnalyticsScopeProvider, Link, type AddressType } from "@yext/pages-components";
import {
  ComprehensiveCTA,
  EntityField,
  type EnhancedTranslatableCTA,
  type ComprehensiveCTAValue,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  normalizeLink,
  resolveComponentData,
  useDocument,
  YextAutoField,
  type ThemeColor,
  type YextComponentConfig,
  type YextCTAField,
  type YextCustomFieldRenderProps,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { parsePhoneNumber } from "awesome-phonenumber";
import { PuckComponent } from "@puckeditor/core";

type CtaButtonStyles = NonNullable<ComprehensiveCTAValue["styles"]["button"]>;
type CtaLinkStyles = NonNullable<ComprehensiveCTAValue["styles"]["link"]>;

const DEFAULT_CTA_TEXT_STYLES = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
} satisfies Pick<
  CtaButtonStyles,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "textTransform"
>;

const DEFAULT_CTA_BUTTON_STYLES = {
  ...DEFAULT_CTA_TEXT_STYLES,
  borderRadius: "default",
  letterSpacing: "default",
} satisfies CtaButtonStyles;

const DEFAULT_CTA_LINK_STYLES = {
  ...DEFAULT_CTA_TEXT_STYLES,
  letterSpacing: "default",
  includeCaret: "default",
} satisfies CtaLinkStyles;

const DEFAULT_COMPREHENSIVE_CTA = {
  data: {
    actionType: "link",
    cta: {
      field: "",
      constantValue: {
        ctaType: "textAndLink",
        label: "Call to Action",
        link: "#",
        linkType: "URL",
      },
      constantValueEnabled: true,
      selectedType: "textAndLink",
    },
    openInNewTab: false,
    buttonText: "Button",
    customId: "",
    customClass: "",
    dataAttributes: [],
    ariaLabel: "Button",
  },
  styles: {
    variant: "primary",
    presetImage: "app-store",
    button: DEFAULT_CTA_BUTTON_STYLES,
    link: DEFAULT_CTA_LINK_STYLES,
  },
} satisfies ComprehensiveCTAValue;

function isPresetImageCta(
  value: unknown,
): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const ctaValue = value as {
    data?: {
      cta?: {
        selectedType?: string;
        constantValue?: {
          ctaType?: string;
        };
      };
    };
  };
  return (
    ctaValue.data?.cta?.constantValue?.ctaType === "presetImage" ||
    ctaValue.data?.cta?.selectedType === "presetImage"
  );
}

function renderButtonStylesFieldWithoutBorderRadius({
  field,
  value,
  onChange,
}: YextCustomFieldRenderProps<CtaButtonStyles>) {
  const resolvedValue = {
    ...DEFAULT_CTA_BUTTON_STYLES,
    ...value,
  };

  return (
    <YextAutoField
      field={{
        type: "object",
        label: field.label,
        objectFields: {
          typography: {
            label: "Typography",
            type: "styledText",
          },
          letterSpacing: {
            label: "Letter Spacing",
            type: "basicSelector",
            options: "LETTER_SPACING",
          },
        },
      }}
      value={{
        typography: {
          fontFamily: resolvedValue.fontFamily,
          fontSize: resolvedValue.fontSize,
          fontWeight: resolvedValue.fontWeight,
          fontStyle: resolvedValue.fontStyle,
          textTransform: resolvedValue.textTransform,
        },
        letterSpacing: resolvedValue.letterSpacing,
      }}
      onChange={(nextValue) => {
        onChange({
          ...resolvedValue,
          ...nextValue.typography,
          letterSpacing: nextValue.letterSpacing ?? resolvedValue.letterSpacing,
        });
      }}
    />
  );
}

function renderComprehensiveCtaFieldWithoutBorderRadius({
  field,
  value,
  onChange,
}: YextCustomFieldRenderProps<ComprehensiveCTAValue>) {
  const resolvedValue = {
    ...DEFAULT_COMPREHENSIVE_CTA,
    ...value,
    data: {
      ...DEFAULT_COMPREHENSIVE_CTA.data,
      ...value?.data,
      cta: {
        ...DEFAULT_COMPREHENSIVE_CTA.data.cta,
        ...value?.data?.cta,
        constantValue: {
          ...DEFAULT_COMPREHENSIVE_CTA.data.cta.constantValue,
          ...value?.data?.cta?.constantValue,
        },
      },
    },
    styles: {
      ...DEFAULT_COMPREHENSIVE_CTA.styles,
      ...value?.styles,
      button: {
        ...DEFAULT_CTA_BUTTON_STYLES,
        ...value?.styles?.button,
      },
      link: {
        ...DEFAULT_CTA_LINK_STYLES,
        ...value?.styles?.link,
      },
    },
  } satisfies ComprehensiveCTAValue;

  const isButton = resolvedValue.data.actionType === "button";
  const constantCtaType = resolvedValue.data.cta.constantValue.ctaType;
  const selectedCtaType = resolvedValue.data.cta.selectedType;
  const ctaType = isButton
    ? "textAndLink"
    : constantCtaType === "presetImage" || selectedCtaType === "presetImage"
      ? "presetImage"
      : (selectedCtaType ?? constantCtaType ?? "textAndLink");
  const isPresetImage = ctaType === "presetImage";
  const showColor = !isPresetImage;
  const showButtonStyles =
    !isPresetImage && resolvedValue.styles.variant !== "link";
  const showLinkStyles =
    !isPresetImage && resolvedValue.styles.variant === "link";

  return (
    <YextAutoField
      field={{
        type: "object",
        label: field.label,
        objectFields: {
          data: {
            type: "object",
            label: "Data",
            objectFields: {
              actionType: {
                type: "radio",
                label: "Action Type",
                options: [
                  { label: "Link", value: "link" },
                  { label: "Button", value: "button" },
                ],
              },
              cta: {
                type: "ctaSelector",
                label: "CTA",
                visible: !isButton,
              },
              openInNewTab: {
                type: "radio",
                label: "Open in New Tab",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
                visible: !isButton,
              },
              buttonText: {
                type: "translatableString",
                label: "Button Text",
                filter: { types: ["type.string"] },
                visible: isButton,
              },
              customId: {
                type: "text",
                label: "Custom Id",
                visible: isButton,
              },
              customClass: {
                type: "text",
                label: "Custom Class",
                visible: isButton,
              },
              dataAttributes: {
                type: "array",
                label: "Data Attributes",
                defaultItemProps: {
                  key: "",
                  value: "",
                },
                arrayFields: {
                  key: {
                    type: "text",
                    label: "Key",
                  },
                  value: {
                    type: "text",
                    label: "Value",
                  },
                },
                getItemSummary: (item: { key?: string }, index?: number) =>
                  item?.key?.trim() ? item.key : `Attribute ${(index ?? 0) + 1}`,
                visible: isButton,
              },
              ariaLabel: {
                type: "translatableString",
                label: "Aria Label",
                filter: { types: ["type.string"] },
                visible: isButton,
              },
            },
          },
          styles: {
            type: "object",
            label: "Styles",
            objectFields: {
              variant: {
                type: "radio",
                label: "Variant",
                options: [
                  { label: "Solid", value: "primary" },
                  { label: "Outline", value: "secondary" },
                  { label: "Link", value: "link" },
                ],
                visible: !isPresetImage,
              },
              presetImage: {
                type: "basicSelector",
                label: "Preset Image",
                options: "PRESET_IMAGE",
                visible: isPresetImage,
              },
              color: {
                type: "basicSelector",
                label: "Color",
                options: "SITE_COLOR",
                visible: showColor,
              },
              button: {
                type: "custom",
                label: "Button Styles",
                visible: showButtonStyles,
                render: renderButtonStylesFieldWithoutBorderRadius,
              },
              link: {
                type: "styledLink",
                label: "Link Styles",
                visible: showLinkStyles,
              },
            },
          },
        },
      }}
      value={resolvedValue}
      onChange={onChange}
    />
  );
}

type SocialIcon = "facebook" | "x" | "pinterest" | "youtube" | "instagram" | "tiktok";

type FooterSocialLink = {
  cta: YextCTAField;
  ariaLabel: string;
  icon: SocialIcon;
};

type FooterLink = {
  cta: YextCTAField;
};

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type AddressFieldProps = {
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type ResolvedPhoneItem = {
  constantValueEnabled: boolean | undefined;
  fieldId: string;
  formattedNumber: string;
  key: string;
  label: string;
  telDigits: string;
};

type BoutiqueShopFooterProps = {
  id?: string;
  section: ThemeSection;
  brandLabel: ComprehensiveCTAValue;
  socialLinks: FooterSocialLink[];
  primaryLinks: FooterLink[];
  secondaryLinks: FooterLink[];
  address: AddressFieldProps;
  phone: PhoneFieldProps;
};

type StoreDocument = {
  address?: AddressType;
  locale?: string;
  mainPhone?: string;
};

const FOOTER_STYLES = `
  .boutique-footer {
  }

  .boutique-footer p {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .boutique-footer li {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .boutique-footer h1 {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .boutique-footer h2 {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .boutique-footer h3 {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .boutique-footer h4 {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .boutique-footer h5 {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .boutique-footer h6 {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .boutique-footer a {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .boutique-footer__inner {
    max-width: 1600px;
    margin: 0 auto;
    padding: 120px 64px 96px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  .boutique-footer__top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
    gap: 96px;
    align-items: start;
  }

  .boutique-footer__brandBlock {
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-width: 0;
  }

  .boutique-footer .boutique-footer__brand {
    color: inherit;
    font-size: clamp(1.5rem, 4vw, 2.3rem);
    font-weight: 600;
    letter-spacing: 0.1em;
    line-height: 1.1;
    max-width: 100%;
    text-transform: uppercase;
    text-decoration: none;
  }

  .boutique-footer .boutique-footer__brand:visited {
    color: inherit;
    text-decoration: none;
  }

  .boutique-footer .boutique-footer__brand:hover,
  .boutique-footer .boutique-footer__brand:focus-visible {
    color: inherit;
    text-decoration: underline;
  }

  .boutique-footer__social {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
  }

  .boutique-footer__socialLink {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    text-decoration: none;
    line-height: 0;
  }

  .boutique-footer__socialLink:hover {
    opacity: 0.78;
  }

  .boutique-footer__socialLink svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  .boutique-footer__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 38px;
    padding-top: 148px;
  }

  .boutique-footer__primaryNav,
  .boutique-footer__secondary {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    row-gap: 22px;
  }

  .boutique-footer__secondary {
    padding-top: 10px;
  }

  .boutique-footer .boutique-footer__link {
    color: inherit;
    font-size: 1.05rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    text-transform: uppercase;
  }

  .boutique-footer .boutique-footer__link:visited {
    color: inherit;
    text-decoration: none;
  }

  .boutique-footer .boutique-footer__link:hover,
  .boutique-footer .boutique-footer__link:focus-visible {
    color: inherit;
    text-decoration: underline;
  }

  .boutique-footer__address {
    margin-left: auto;
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    text-align: right;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .boutique-footer__address a {
    color: inherit;
    text-decoration: none;
  }

  .boutique-footer__address a:hover {
    opacity: 0.92;
    text-decoration: underline;
  }

  .boutique-footer__address a:focus-visible {
    text-decoration: underline;
  }

  @media (max-width: 1024px) {
    .boutique-footer__inner {
      padding: 72px 24px 56px;
    }

    .boutique-footer__top {
      grid-template-columns: 1fr;
      gap: 48px;
    }

    .boutique-footer__meta {
      padding-top: 0;
    }

    .boutique-footer .boutique-footer__brand {
      letter-spacing: 0.08em;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .boutique-footer__address {
      margin-left: 0;
      align-items: flex-start;
      text-align: left;
    }
  }
`;

function getFooterLinkHref(value: string | undefined): string {
  return typeof value === "string" && value.length > 0 ? value : "#";
}

function getFooterTextValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "defaultValue" in value &&
    typeof value.defaultValue === "string"
  ) {
    return value.defaultValue;
  }

  return "";
}

function renderFooterSocialIcon(icon: SocialIcon): React.ReactNode {
  switch (icon) {
    case "facebook":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M11 0H8C5.2 0 3 2.2 3 5v3H0v4h3v8h4v-8h3l1-4H7V5c0-.6.4-1 1-1h3V0Z" />
        </svg>
      );
    case "x":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M17.425641 0H20.818462L13.406154 8.471795 22.126154 20H15.298462L9.950769 13.008205 3.831795 20H.436923L8.365128 10.938462 0 0H7.001026l4.833846 6.390769L17.425641 0Zm-1.190769 17.969231h1.88L5.979487 1.924103H3.962051l12.272821 16.045128Z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M0 7.2c0-.8.1-1.7.4-2.4.4-.8.8-1.5 1.3-2s1.2-1.1 1.9-1.5 1.5-.8 2.3-.9C6.5.1 7.3 0 8.1 0c1.3 0 2.5.3 3.6.8s2 1.3 2.7 2.3c.7 1.1 1.1 2.3 1.1 3.6 0 .8-.1 1.5-.3 2.3-.1.8-.4 1.5-.7 2.1-.3.7-.7 1.2-1.2 1.7-.5.5-1.1.9-1.7 1.2s-1.5.5-2.3.4c-.5 0-1.1-.1-1.6-.4-.7-.1-1.1-.5-1.2-.9-.3-.1-.7-.4-.9-.7-.4-.3-.7-.7-.8-1.1C0.4 9.3 0.3 8.9 0.1 8.5.1 8.1 0 7.6 0 7.2Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg aria-hidden="true" viewBox="0 0 28 20">
          <path d="M28 3.3c-.3-1.3-1.3-2.1-2.4-2.4C23.3 0 14.3 0 14.3 0S5.5 0 3.3.6C2 1 1 1.9.7 3.1 0 5.4 0 9.9 0 9.9s0 4.7.7 6.8C1 18 2 19 3.3 19.3c2.2.7 11 .7 11 .7s8.9 0 11.1-.7c1.3-.3 2.1-1.3 2.4-2.4.7-2.3.7-6.8.7-6.8S28.6 5.4 28 3.3ZM11.5 14.3V5.9l7.3 4.2-7.3 4.2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M10 4.8C7.2 4.8 4.9 7.1 4.9 9.9S7.2 15 10 15s5.1-2.3 5.1-5.1S12.8 4.8 10 4.8Zm0 8.4c-1.8 0-3.3-1.5-3.3-3.3S8.2 6.6 10 6.6s3.3 1.5 3.3 3.3-1.5 3.3-3.3 3.3Zm5.2-9.8c-.6 0-1.1.5-1.1 1.1s.5 1.3 1.1 1.3 1.3-.5 1.3-1.1c0-.3-.1-.6-.4-.9s-.5-.4-.9-.4Zm4.7 6.5c0-1.4 0-2.7-.1-4.1-.1-1.5-.4-3-1.6-4.2C17 .5 15.6.1 13.9 0c-1.2 0-2.6 0-3.9 0C8.6 0 7.2 0 5.8.1c-1.5 0-2.9.4-4.1 1.5S0.2 4.1 0.1 5.8C0 7.2 0 8.6 0 9.9c0 1.3 0 2.8.1 4.2.1 1.5.4 3 1.6 4.2 1.1 1.1 2.5 1.5 4.2 1.6C7.3 20 8.6 20 10 20s2.7 0 4.1-.1c1.5-.1 3-.4 4.2-1.6 1.1-1.1 1.5-2.5 1.6-4.2.1-1.4.1-2.8.1-4.2Zm-2.3 5.8c-.1.5-.4.8-.8 1.1-.4.4-.6.5-1.1.8-1.3.5-4.4.4-5.8.4s-4.6.1-5.8-.4c-.5-.1-.8-.4-1.1-.8-.4-.4-.5-.6-.8-1.1-.5-1.3-.4-4.4-.4-5.8s-.1-4.6.4-5.8c.1-.5.4-.8.8-1.1.4-.4.6-.5 1.1-.8 1.3-.5 4.4-.4 5.8-.4s4.6-.1 5.8.4c.5.1.8.4 1.1.8.4.4.5.6.8 1.1.5 1.3.4 4.4.4 5.8s.2 4.5-.4 5.8Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden="true" viewBox="0 0 16 20">
          <path d="M11.9 0c.1 0 .2 0 .3.1.1.1.1.2.1.3 0 .4.1.9.4 1.2.6.8 1.6 1.1 2.5.6.1-.1.2-.1.3 0l0 0c.1.1.2.2.2.3l0 0v4c0 .2-.1.3-.3.4-.9.3-1.8.3-2.6.1l0 0V14c0 0 0 .1 0 .2-.3 3.5-3.4 6.1-6.9 5.8-3.6-.3-6.2-3.4-5.9-7 .3-3.2 2.9-5.7 6.1-5.8h.1c.2 0 .4.1.4.3l0 0 0 0V12c0 .2-.2.4-.3.4-.7.1-1.2.6-1.2 1.3 0 .7.6 1.3 1.3 1.3s1.2-.5 1.3-1.2l0 0V0.4C7.6.2 7.8 0 8 0l0 0h3.9Z" />
        </svg>
      );
    default:
      return null;
  }
}

function resolveFooterSocialAriaLabel(
  socialLink: FooterSocialLink,
): string {
  const label = socialLink.ariaLabel?.trim();
  if (label) {
    return label;
  }

  const ctaLabel = getFooterTextValue(
    socialLink.cta?.constantValue?.label,
  );
  if (typeof ctaLabel === "string" && ctaLabel.trim()) {
    return ctaLabel.trim();
  }

  return socialLink.icon;
}

function getResolvedFooterLink(
  ctaField: YextCTAField,
  locale: string,
  streamDocument: StoreDocument,
): EnhancedTranslatableCTA | undefined {
  return resolveComponentData(
    ctaField,
    locale,
    streamDocument,
  ) as EnhancedTranslatableCTA | undefined;
}

function getFooterLinkSummary(item: FooterLink): string {
  const label = item.cta.constantValue?.label;

  return (
    (typeof label === "string" ? label : label?.defaultValue) ||
    item.cta.field ||
    "Link"
  );
}

function formatPhoneNumber(
  phoneNumberString: string,
  format: "international" | "domestic",
): string {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);

  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
}

const FooterComponent: PuckComponent<BoutiqueShopFooterProps> = (props) => {
  const streamDocument = useDocument<StoreDocument>();
  const scopeName = `YextBoutiqueShopFooter${getAnalyticsScopeHash(props.id ?? "footer")}`;
  const locale = streamDocument.locale ?? "en";
  const resolvedAddress = resolveComponentData(
    props.address.address,
    locale,
    streamDocument,
  );
  const sectionForeground = getThemeColorCssValue(
    props.section.backgroundColor.contrastingColor,
  );

  const resolvedPhoneItems: ResolvedPhoneItem[] = (props.phone.items ?? [])
    .map((item): ResolvedPhoneItem | null => {
      const resolvedPhoneNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const phoneNumber =
        typeof resolvedPhoneNumber === "string"
          ? resolvedPhoneNumber.trim()
          : "";
      const label = item.label?.trim() ?? "";

      if (!phoneNumber) return null;

      return {
        constantValueEnabled: item.number.constantValueEnabled,
        fieldId: item.number.field,
        formattedNumber: formatPhoneNumber(
          phoneNumber,
          props.phone.phoneFormat,
        ),
        key: `${label}-${phoneNumber}`,
        label,
        telDigits: phoneNumber.replace(/\D/g, ""),
      };
    })
    .filter((item): item is ResolvedPhoneItem => item !== null);

  const resolvedPrimaryLinks = (props.primaryLinks ?? [])
    .map((item, index) => {
      const resolved = getResolvedFooterLink(item.cta, locale, streamDocument);
      const label =
        typeof resolved?.label === "string"
          ? resolved.label
          : (resolved?.label?.defaultValue ?? "");
      const link = typeof resolved?.link === "string" ? resolved.link : "";

      if (!label || !link) {
        return null;
      }

      return {
        constantValueEnabled: item.cta.constantValueEnabled,
        fieldId: item.cta.field,
        key: `primary-${index}`,
        label,
        link: normalizeLink(link, resolved?.linkType ?? "URL"),
        openInNewTab: resolved?.openInNewTab ?? false,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const resolvedSecondaryLinks = (props.secondaryLinks ?? [])
    .map((item, index) => {
      const resolved = getResolvedFooterLink(item.cta, locale, streamDocument);
      const label =
        typeof resolved?.label === "string"
          ? resolved.label
          : (resolved?.label?.defaultValue ?? "");
      const link = typeof resolved?.link === "string" ? resolved.link : "";

      if (!label || !link) {
        return null;
      }

      return {
        constantValueEnabled: item.cta.constantValueEnabled,
        fieldId: item.cta.field,
        key: `secondary-${index}`,
        label,
        link: normalizeLink(link, resolved?.linkType ?? "URL"),
        openInNewTab: resolved?.openInNewTab ?? false,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const resolvedSocialLinks = (props.socialLinks ?? [])
    .map((item, index) => {
      const resolved = getResolvedFooterLink(item.cta, locale, streamDocument);
      const link = typeof resolved?.link === "string" ? resolved.link : "";

      if (!link) {
        return null;
      }

      return {
        key: `social-${index}`,
        ariaLabel: resolveFooterSocialAriaLabel(item),
        constantValueEnabled: item.cta.constantValueEnabled,
        fieldId: item.cta.field,
        href: normalizeLink(link, resolved?.linkType ?? "URL"),
        icon: item.icon,
        openInNewTab: resolved?.openInNewTab ?? false,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const isBrandPresetImage = isPresetImageCta(props.brandLabel);
  const renderedBrandLabel = isBrandPresetImage
    ? ({
        ...props.brandLabel,
        styles: {
          presetImage: props.brandLabel.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : (props.brandLabel as Partial<ComprehensiveCTAValue>);

  return (
    <AnalyticsScopeProvider name={scopeName}>
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <footer
          className="boutique-footer"
          style={getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          )}
        >
          <style>{FOOTER_STYLES}</style>
          <div className="boutique-footer__inner">
            <div className="boutique-footer__top">
              <div className="boutique-footer__brandBlock">
                <EntityField
                  displayName="Brand Link"
                  fieldId={props.brandLabel.data.cta.field}
                  constantValueEnabled={
                    props.brandLabel.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    alwaysHideCaret={isBrandPresetImage ? undefined : true}
                    className={
                      isBrandPresetImage ? undefined : "boutique-footer__brand"
                    }
                    value={renderedBrandLabel}
                  />
                </EntityField>

                <div
                  className="boutique-footer__social"
                  aria-label="Social links"
                >
                  {resolvedSocialLinks.map((socialLink) => {
                    return (
                      <EntityField
                        key={`${socialLink.key}-${socialLink.icon}`}
                        displayName="Social Link"
                        fieldId={socialLink.fieldId}
                        constantValueEnabled={socialLink.constantValueEnabled}
                      >
                        <a
                          aria-label={socialLink.ariaLabel}
                          className="boutique-footer__socialLink"
                          href={getFooterLinkHref(socialLink.href)}
                          rel={
                            socialLink.openInNewTab ? "noreferrer" : undefined
                          }
                          target={
                            socialLink.openInNewTab ? "_blank" : undefined
                          }
                        >
                          {renderFooterSocialIcon(socialLink.icon)}
                        </a>
                      </EntityField>
                    );
                  })}
                </div>

                <div className="boutique-footer__meta">
                  <div
                    className="boutique-footer__primaryNav"
                    aria-label="Footer navigation"
                  >
                    {resolvedPrimaryLinks.map((link) => (
                      <EntityField
                        key={link.key}
                        displayName="Primary Link"
                        fieldId={link.fieldId}
                        constantValueEnabled={link.constantValueEnabled}
                      >
                        <a
                          className="boutique-footer__link"
                          href={link.link}
                          rel={link.openInNewTab ? "noreferrer" : undefined}
                          target={link.openInNewTab ? "_blank" : undefined}
                        >
                          {link.label}
                        </a>
                      </EntityField>
                    ))}
                  </div>

                  <div
                    className="boutique-footer__secondary"
                    aria-label="Secondary footer links"
                  >
                    {resolvedSecondaryLinks.map((link) => (
                      <EntityField
                        key={link.key}
                        displayName="Secondary Link"
                        fieldId={link.fieldId}
                        constantValueEnabled={link.constantValueEnabled}
                      >
                        <a
                          className="boutique-footer__link"
                          href={link.link}
                          rel={link.openInNewTab ? "noreferrer" : undefined}
                          target={link.openInNewTab ? "_blank" : undefined}
                        >
                          {link.label}
                        </a>
                      </EntityField>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="boutique-footer__address"
                style={{ color: sectionForeground }}
              >
                {resolvedAddress ? (
                  <EntityField
                    displayName="Address"
                    fieldId={props.address.address.field}
                    constantValueEnabled={
                      props.address.address.constantValueEnabled
                    }
                  >
                    <Address
                      address={resolvedAddress}
                      showRegion={props.address.showRegion}
                      showCountry={props.address.showCountry}
                    />
                  </EntityField>
                ) : null}

                {resolvedPhoneItems.map((item) => {
                  const content = item.label
                    ? `${item.label} ${item.formattedNumber}`
                    : item.formattedNumber;

                  return (
                    <EntityField
                      key={item.key}
                      displayName="Phone Number"
                      fieldId={item.fieldId}
                      constantValueEnabled={item.constantValueEnabled}
                    >
                      {!props.phone.includeHyperlink || !item.telDigits ? (
                        <div>{content}</div>
                      ) : (
                        <Link
                          cta={{
                            link: item.telDigits,
                            linkType: "PHONE",
                          }}
                        >
                          {content}
                        </Link>
                      )}
                    </EntityField>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const makeLink = (label: string, link: string): FooterLink => ({
  cta: {
    field: "",
    constantValue: {
      label: { defaultValue: label },
      link: { defaultValue: link },
      linkType: "URL",
      openInNewTab: false,
    },
    constantValueEnabled: true,
  },
});

const socialIconOptions: Array<{ label: string; value: SocialIcon }> = [
  { label: "Facebook", value: "facebook" },
  { label: "X", value: "x" },
  { label: "Pinterest", value: "pinterest" },
  { label: "YouTube", value: "youtube" },
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
];

const makeSocialLink = (
  icon: SocialIcon,
  label: string,
  link: string,
): FooterSocialLink => ({
  cta: {
    field: "",
    constantValue: {
      label: { defaultValue: label },
      link: { defaultValue: link },
      linkType: "URL",
      openInNewTab: true,
    },
    constantValueEnabled: true,
  },
  ariaLabel: label,
  icon,
});

function getFooterSocialSummary(item: FooterSocialLink): string {
  const ctaLabel = item.cta?.constantValue?.label;

  return (
    item.ariaLabel ||
    (typeof ctaLabel === "string" ? ctaLabel : ctaLabel?.defaultValue) ||
    item.cta.field ||
    item.icon ||
    "Social Link"
  );
}

const footerFields: YextFields<BoutiqueShopFooterProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          {
            label: "Yes",
            value: true,
          },
          {
            label: "No",
            value: false,
          },
        ],
      },
    },
  },
  brandLabel: {
    label: "Brand Label",
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      cta: {
        label: "CTA",
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      },
      ariaLabel: {
        label: "Aria Label",
        type: "text",
      },
      icon: {
        label: "Icon",
        type: "radio",
        options: socialIconOptions,
      },
    },
    defaultItemProps: makeSocialLink("facebook", "Facebook", "#"),
    getItemSummary: getFooterSocialSummary,
  },
  primaryLinks: {
    label: "Primary Links",
    type: "array",
    arrayFields: {
      cta: {
        label: "Link",
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      },
    },
    defaultItemProps: makeLink("Link", "#"),
    getItemSummary: getFooterLinkSummary,
  },
  secondaryLinks: {
    label: "Secondary Links",
    type: "array",
    arrayFields: {
      cta: {
        label: "Link",
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      },
    },
    defaultItemProps: makeLink("Link", "#"),
    getItemSummary: getFooterLinkSummary,
  },
  address: {
    label: "Address",
    type: "object",
    objectFields: {
      address: {
        type: "entityField",
        label: "Address",
        filter: {
          types: ["type.address"],
        },
      },
      showRegion: {
        label: "Show Region",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showCountry: {
        label: "Show Country",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  phone: {
    label: "Phone",
    type: "object",
    objectFields: {
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          number: {
            label: "Number",
            type: "entityField",
            filter: {
              types: ["type.phone"],
            },
          },
          label: {
            label: "Label",
            type: "text",
          },
        },
        defaultItemProps: {
          label: "Main",
          number: {
            constantValue: "",
            constantValueEnabled: false,
            field: "mainPhone",
          } as YextEntityField<string>,
        },
        getItemSummary: (item) =>
          item.label ||
          item.number?.constantValue ||
          item.number?.field ||
          "Phone",
      },
      phoneFormat: {
        label: "Phone Format",
        type: "radio",
        options: [
          {
            label: "Domestic",
            value: "domestic",
          },
          {
            label: "International",
            value: "international",
          },
        ],
      },
      includeHyperlink: {
        label: "Include Hyperlink",
        type: "radio",
        options: [
          {
            label: "Yes",
            value: true,
          },
          {
            label: "No",
            value: false,
          },
        ],
      },
    },
  },
};

export const BoutiqueShopFooter: YextComponentConfig<BoutiqueShopFooterProps> = {
  label: "Footer",
  render: (props: any) => <FooterComponent {...props} />,
  fields: footerFields,
  defaultProps: {
    section: {
      backgroundColor: {
        selectedColor: "palette-secondary-dark",
        contrastingColor: "white",
      },
      visibleOnLivePage: true,
    },
    brandLabel: {
      data: {
        actionType: "link",
        cta: {
          constantValue: {
            label: { defaultValue: "Northline Apparel" },
            link: "#",
            linkType: "URL",
          },
          constantValueEnabled: true,
          field: "",
        },
        openInNewTab: false,
      },
      styles: {
        variant: "link",
      },
    },
    socialLinks: [
      makeSocialLink("facebook", "Facebook", "#"),
      makeSocialLink("x", "X", "#"),
      makeSocialLink("pinterest", "Pinterest", "#"),
      makeSocialLink("youtube", "YouTube", "#"),
      makeSocialLink("instagram", "Instagram", "#"),
      makeSocialLink("tiktok", "TikTok", "#"),
    ],
    primaryLinks: [
      makeLink("Departments", "#"),
      makeLink("Shopping Services", "#"),
      makeLink("Locations", "#"),
    ],
    secondaryLinks: [makeLink("Returns", "#"), makeLink("Contact", "#")],
    address: {
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
          region: "",
        },
        constantValueEnabled: false,
      } as YextEntityField<AddressType>,
      showRegion: true,
      showCountry: true,
    },
    phone: {
      includeHyperlink: true,
      items: [
        {
          label: "",
          number: {
            constantValue: "",
            constantValueEnabled: false,
            field: "mainPhone",
          } as YextEntityField<string>,
        },
      ],
      phoneFormat: "domestic",
    },
  },
};

export default BoutiqueShopFooter;

export const config: SectionConfig = {
  id: "BoutiqueShopFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
