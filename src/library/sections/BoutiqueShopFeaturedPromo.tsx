import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  MaybeRTF,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  YextAutoField,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextCustomFieldRenderProps,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
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

function isPresetImageCta(value: unknown): boolean {
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
                  item?.key?.trim()
                    ? item.key
                    : `Attribute ${(index ?? 0) + 1}`,
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

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: any;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: string | ThemeColor;
};

type PromoImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BoutiqueShopFeaturedPromoProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  body: StyledRtfProps;
  cta: ComprehensiveCTAValue;
  promoImage: PromoImageProps;
};

type CtaColorSource = {
  styles?: {
    color?: ThemeColor;
  };
};

const DEFAULT_PROMO_IMAGE = {
  url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
  width: 1267,
  height: 1900,
};

const PROMO_STYLES = `
.boutique-featured-promo {
  padding: 72px 0 96px;
}

.boutique-featured-promo p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-featured-promo li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-featured-promo h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-featured-promo h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-featured-promo h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-featured-promo h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-featured-promo h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-featured-promo h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-featured-promo a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-featured-promo__shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
}

.boutique-featured-promo__split {
  align-items: stretch;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  min-height: 500px;
}

.boutique-featured-promo__media {
  height: 500px;
  overflow: hidden;
}

.boutique-featured-promo__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.boutique-featured-promo__promo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 48px 40px;
}

.boutique-featured-promo__promo h2,
.boutique-featured-promo__promo p {
  margin: 0;
}

.boutique-featured-promo__cta {
  align-items: center;
  display: flex;
  justify-content: flex-start;
  min-height: 52px;
}

.boutique-events__button {
  align-items: center;
  border-radius: 0 !important;
  display: inline-flex !important;
  font-size: 0.78rem;
  font-weight: 700;
  justify-self: start;
  letter-spacing: 0.08em;
  min-height: 52px;
  padding: 0 24px;
  text-decoration: none !important;
  text-transform: uppercase;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
  width: fit-content;
}

.boutique-events__button--primary,
.boutique-events__button--primary:visited {
  background: var(--button-bg) !important;
  border: 1px solid var(--button-text) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-text) !important;
}

.boutique-events__button--secondary,
.boutique-events__button--secondary:visited {
  background: transparent !important;
  border: 1px solid var(--button-bg) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-bg) !important;
}

.boutique-events__button--primary:hover,
.boutique-events__button--primary:focus-visible,
.boutique-events__button--secondary:hover,
.boutique-events__button--secondary:focus-visible {
  box-shadow: none !important;
  transform: translate(6px, 6px);
}

.boutique-events__button--link,
.boutique-events__button--link:visited {
  align-items: center;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  color: var(--button-bg) !important;
  display: inline-flex !important;
  gap: 8px;
  line-height: 1.5 !important;
  min-height: auto;
  padding: 0 0 4px !important;
  position: relative;
  text-decoration: none !important;
  text-transform: var(--textTransform-link-textTransform) !important;
  transition:
    color 0.2s ease,
    opacity 0.2s ease !important;
  transform: none !important;
  width: fit-content;
}

.boutique-events__button--link::after {
  background: currentColor;
  bottom: 0;
  content: "";
  height: 1px;
  left: 0;
  opacity: 0.7;
  position: absolute;
  right: 0;
  transform: scaleX(0.72);
  transform-origin: left center;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.boutique-events__button--link:hover,
.boutique-events__button--link:focus-visible {
  box-shadow: none !important;
  color: var(--button-bg) !important;
  opacity: 0.82;
  text-decoration: none !important;
  transform: none !important;
}

.boutique-events__button--link:hover::after,
.boutique-events__button--link:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

@media (max-width: 1024px) {
  .boutique-featured-promo {
    padding: 64px 0;
  }

  .boutique-featured-promo__shell {
    padding: 0 18px;
  }

  .boutique-featured-promo__split {
    grid-template-columns: 1fr;
  }

  .boutique-featured-promo__promo {
    padding: 32px 24px;
  }
}
`;

function resolveExplicitColor(
  fontColor: string | ThemeColor | undefined,
): React.CSSProperties | undefined {
  const color = getThemeColorCssValue(fontColor);
  return color ? { color } : undefined;
}

function getCtaColorStyle(
  cta: CtaColorSource,
  ctaVariant: "primary" | "secondary" | "link",
  sectionForeground: string,
): React.CSSProperties {
  const explicitColor = getThemeColorCssValue(cta.styles?.color);
  const selectedColor =
    explicitColor ?? (ctaVariant === "primary" ? "#262b2c" : sectionForeground);
  const contrastingColor =
    getThemeColorCssValue(cta.styles?.color?.contrastingColor) ?? "#ffffff";

  return {
    "--button-bg": selectedColor,
    "--button-text": contrastingColor,
  } as React.CSSProperties;
}

function renderResolvedRichText(resolvedValue: unknown): React.ReactNode {
  if (React.isValidElement(resolvedValue)) {
    return resolvedValue;
  }

  if (typeof resolvedValue === "string") {
    return <MaybeRTF data={resolvedValue} />;
  }

  if (
    resolvedValue &&
    typeof resolvedValue === "object" &&
    "html" in resolvedValue
  ) {
    return <MaybeRTF data={resolvedValue as any} />;
  }

  return null;
}

function renderImage(
  image: PromoImageProps,
  locale: string,
  streamDocument: Record<string, unknown>,
) {
  const resolvedImage = resolveComponentData(
    image?.image,
    locale,
    streamDocument,
  );
  const resolvedImageUrl =
    resolvedImage && typeof resolvedImage === "object"
      ? "image" in resolvedImage &&
        resolvedImage.image &&
        typeof resolvedImage.image === "object" &&
        "url" in resolvedImage.image &&
        typeof resolvedImage.image.url === "string" &&
        resolvedImage.image.url.trim()
        ? resolvedImage.image.url
        : "url" in resolvedImage &&
            typeof resolvedImage.url === "string" &&
            resolvedImage.url.trim()
          ? resolvedImage.url
          : undefined
      : undefined;

  const imageAspectRatio =
    image.aspectRatio > 0 ? image.aspectRatio : undefined;
  const imageFrameStyle: React.CSSProperties = {
    alignItems: "center",
    display: "flex",
    height: "500px",
    justifyContent: "center",
    width: "100%",
  };
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio: imageAspectRatio,
    borderRadius:
      image.styles?.borderRadius === "default"
        ? undefined
        : image.styles?.borderRadius,
    height: imageAspectRatio ? undefined : "500px",
    maxHeight: "500px",
    maxWidth: imageAspectRatio
      ? `min(100%, ${500 * imageAspectRatio}px)`
      : "100%",
    overflow:
      image.imageConstrain === "filled" ||
      Boolean(
        image.styles?.borderRadius && image.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
    width: "100%",
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: image.imageConstrain === "filled" ? "cover" : "contain",
  };

  return (
    <EntityField
      displayName="Promo Image"
      fieldId={image?.image.field}
      constantValueEnabled={image?.image.constantValueEnabled}
    >
      <div style={imageFrameStyle}>
        <div style={imageWrapperStyle}>
          {resolvedImageUrl ? (
            <Image
              image={resolvedImage as any}
              className="h-full"
              style={imageStyle}
            />
          ) : null}
        </div>
      </div>
    </EntityField>
  );
}

function makeCta(label: string): ComprehensiveCTAValue {
  return {
    data: {
      actionType: "link",
      cta: {
        field: "",
        constantValue: {
          label: {
            defaultValue: label,
            hasLocalizedValue: "true",
          },
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
      openInNewTab: false,
    },
    styles: {
      variant: "primary",
      button: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "uppercase",
        borderRadius: "default",
        letterSpacing: "default",
      },
    },
  };
}

const FeaturedPromoComponent: PuckComponent<
  BoutiqueShopFeaturedPromoProps
> = (props) => {
  const { locale, document: streamDocument } = useDocument();
  const resolvedLocale = locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";

  const resolvedBody = resolveComponentData(
    props.body.text,
    resolvedLocale,
    streamDocument,
  );
  const promoImage = renderImage(
    props.promoImage,
    resolvedLocale,
    streamDocument,
  );
  const isPresetImage = isPresetImageCta(props.cta);
  const renderedCtaValue = isPresetImage
    ? ({
        ...props.cta,
        styles: {
          presetImage: props.cta.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : (props.cta as Partial<ComprehensiveCTAValue>);
  const ctaVariant =
    props.cta.styles?.variant === "secondary" ||
    props.cta.styles?.variant === "link"
      ? props.cta.styles.variant
      : "primary";
  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopFeaturedPromo${getAnalyticsScopeHash(
        props.id ?? "promo",
      )}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section
          className="boutique-featured-promo"
          style={sectionSurfaceStyle}
        >
          <style>{PROMO_STYLES}</style>
          <div className="boutique-featured-promo__shell">
            <div className="boutique-featured-promo__split">
              <div className="boutique-featured-promo__media">{promoImage}</div>
              <article
                className="boutique-featured-promo__promo"
                style={sectionSurfaceStyle}
              >
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2
                    style={{
                      ...resolveExplicitColor(props.heading.fontColor),
                      fontFamily: props.heading.styles.fontFamily,
                      fontSize: props.heading.styles.fontSize,
                      fontStyle: props.heading.styles.fontStyle,
                      fontWeight: props.heading.styles.fontWeight,
                      textTransform: props.heading.styles.textTransform,
                    }}
                  >
                    {resolveComponentData(
                      props.heading.text as any,
                      resolvedLocale,
                      streamDocument,
                    ) || ""}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Body"
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div style={resolveExplicitColor(props.body.fontColor)}>
                    {renderResolvedRichText(resolvedBody)}
                  </div>
                </EntityField>
                <div className="boutique-featured-promo__cta">
                  <EntityField
                    displayName="Call to Action"
                    fieldId={props.cta.data.cta.field}
                    constantValueEnabled={
                      props.cta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      alwaysHideCaret={
                        isPresetImage ? undefined : ctaVariant !== "link"
                      }
                      className={
                        isPresetImage
                          ? undefined
                          : [
                              "boutique-events__button",
                              `boutique-events__button--${ctaVariant}`,
                            ].join(" ")
                      }
                      style={
                        isPresetImage
                          ? undefined
                          : getCtaColorStyle(
                              props.cta,
                              ctaVariant,
                              sectionForeground,
                            )
                      }
                      value={renderedCtaValue}
                    />
                  </EntityField>
                </div>
              </article>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const promoFields = {
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
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        label: "Text",
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: "Body",
    type: "object",
    objectFields: {
      text: {
        label: "Text",
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  cta: {
    label: "CTA",
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  promoImage: {
    label: "Promo Image",
    type: "object",
    objectFields: {
      image: {
        label: "Image",
        type: "entityField",
        filter: { types: ["type.image"] },
      },
      aspectRatio: {
        label: "Aspect Ratio",
        type: "basicSelector",
        options: "ASPECT_RATIO",
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
      styles: {
        label: "Image Styles",
        type: "styledImage",
      },
    },
  },
} satisfies YextFields<BoutiqueShopFeaturedPromoProps>;

export const BoutiqueShopFeaturedPromo: YextComponentConfig<BoutiqueShopFeaturedPromoProps> =
  {
    label: "Featured Promo",
    fields: promoFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: { defaultValue: "Shop our Seasonal Collection" },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "inherit",
          fontSize: "24px",
          fontWeight: "400",
          fontStyle: "normal",
          textTransform: "none",
        },
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Explore our latest arrivals featuring sustainable fabrics, modern silhouettes, and timeless essentials.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      cta: makeCta("Shop Now"),
      promoImage: {
        image: {
          field: "",
          constantValue: DEFAULT_PROMO_IMAGE,
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
    },
    render: (props) => <FeaturedPromoComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopFeaturedPromo",
  displayName: "Featured Promo",
  description: "Featured Promo",
  pageSetTypes: ["ENTITY"],
};
