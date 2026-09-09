import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import {
  Address,
  AnalyticsScopeProvider,
  type HoursType,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  EntityField,
  type ComprehensiveCTAValue,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  HoursStatusAtom,
  mergeMeta,
  PhoneAtom,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextCustomFieldRenderProps,
  type YextEntityField,
  type YextFields,
  YextAutoField,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import {
  buildDirectionsUrl,
  renderRichText,
  resolveFontColor,
  resolveThemeColor,
} from "../shared/sectionStyles";

type CtaButtonStyles = NonNullable<ComprehensiveCTAValue["styles"]["button"]>;
type CtaLinkStyles = NonNullable<ComprehensiveCTAValue["styles"]["link"]>;
type NearbyCtaVariant = "primary" | "secondary" | "link";

type NearbyCtaStyles = {
  variant: NearbyCtaVariant;
  color?: ThemeColor;
  button?: CtaButtonStyles;
  link?: CtaLinkStyles;
};

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

const defaultStoreCtaStyles: NearbyCtaStyles = {
  variant: "link",
  link: DEFAULT_CTA_LINK_STYLES,
};

const defaultDirectionsCtaStyles: NearbyCtaStyles = {
  variant: "primary",
  button: DEFAULT_CTA_BUTTON_STYLES,
};

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: string | ThemeColor;
};

type StoreDocument = StreamDocument & {
  locale?: string;
  yextDisplayCoordinate?: {
    latitude?: number;
    longitude?: number;
  };
};

type NearbyLocationCardStyles = {
  cardBackgroundColor: string | ThemeColor;
  cardTitleColor?: string | ThemeColor;
  storeCtaStyles?: NearbyCtaStyles;
  directionsCtaStyles?: NearbyCtaStyles;
  showHours: boolean;
  showPhone: boolean;
  showAddress: boolean;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
    showDayNames: boolean;
  };
  phone: {
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  address: {
    showRegion: boolean;
    showCountry: boolean;
  };
};

type BoutiqueShopNearbyProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  introText: StyledRtfProps;
  radiusMiles: number;
  limit: number;
  cardStyles: NearbyLocationCardStyles;
};

const defaultNearbyCardStyles: NearbyLocationCardStyles = {
  cardBackgroundColor: {
    selectedColor: "palette-tertiary-light",
    contrastingColor: "black",
  },
  cardTitleColor: {
    selectedColor: "palette-primary",
    contrastingColor: "palette-primary-contrast",
  },
  storeCtaStyles: defaultStoreCtaStyles,
  directionsCtaStyles: defaultDirectionsCtaStyles,
  showAddress: true,
  showPhone: true,
  showHours: true,
  hoursStyles: {
    showCurrentStatus: true,
    timeFormat: "12h",
    dayOfWeekFormat: "short",
    showDayNames: true,
  },
  phone: {
    phoneFormat: "domestic",
    includeHyperlink: true,
  },
  address: {
    showRegion: true,
    showCountry: true,
  },
};

const NEARBY_STYLES = `
.boutique-nearby {
  padding: 72px 0;
}

.boutique-nearby p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-nearby li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-nearby h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-nearby h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-nearby h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-nearby h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-nearby h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-nearby h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-nearby a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-nearby__shell {
  margin: 0 auto;
  max-width: 1540px;
  padding: 0 24px;
}

.boutique-nearby__heading {
  letter-spacing: 0.06em;
  line-height: 1.08;
  margin: 0 0 24px;
  text-align: center;
}

.boutique-nearby__map {
  margin-bottom: 24px;
}

.boutique-nearby__grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.boutique-nearby__card {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.boutique-nearby__card-title {
  margin: 0;
}

.boutique-nearby__contact {
  display: grid;
  gap: 10px;
}

.boutique-nearby__phone a,
.boutique-nearby__hours {
  color: inherit;
}

.boutique-nearby__cta {
  justify-self: start;
  width: fit-content;
}

.boutique-nearby__cta--link,
.boutique-nearby__cta--link a {
  border-bottom: 1px solid currentColor;
  color: var(--nearby-cta-color, inherit) !important;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding-bottom: 2px;
  text-decoration: none !important;
  text-transform: uppercase;
}

.boutique-nearby__cta--primary,
.boutique-nearby__cta--primary a,
.boutique-nearby__cta--secondary,
.boutique-nearby__cta--secondary a {
  align-items: center;
  border-radius: 0;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0.08em;
  min-height: 48px;
  padding: 0 20px;
  text-decoration: none !important;
  text-transform: uppercase;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
}

.boutique-nearby__cta--primary,
.boutique-nearby__cta--primary:visited {
  background: var(--nearby-cta-color, var(--card-foreground));
  border: 1px solid var(--nearby-cta-text, var(--card-background));
  box-shadow: 6px 6px 0 var(--nearby-cta-color, var(--card-foreground));
  color: var(--nearby-cta-text, var(--card-background)) !important;
}

.boutique-nearby__cta--secondary,
.boutique-nearby__cta--secondary:visited {
  background: transparent;
  border: 1px solid var(--nearby-cta-color, var(--card-foreground));
  box-shadow: 6px 6px 0 var(--nearby-cta-color, var(--card-foreground));
  color: var(--nearby-cta-color, var(--card-foreground)) !important;
}

.boutique-nearby__cta--primary:hover,
.boutique-nearby__cta--primary:focus-visible,
.boutique-nearby__cta--secondary:hover,
.boutique-nearby__cta--secondary:focus-visible {
  box-shadow: none;
  transform: translate(6px, 6px);
}

@media (max-width: 1024px) {
  .boutique-nearby {
    padding: 64px 0;
  }

  .boutique-nearby__shell {
    padding: 0 18px;
  }

  .boutique-nearby__grid {
    grid-template-columns: 1fr;
  }
}
`;


function renderCtaButtonStylesFieldWithoutBorderRadius({
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

function renderNearbyCtaStylesField({
  field,
  value,
  onChange,
}: YextCustomFieldRenderProps<NearbyCtaStyles>) {
  const resolvedValue = {
    ...value,
    variant: value?.variant ?? "primary",
    button: {
      ...DEFAULT_CTA_BUTTON_STYLES,
      ...value?.button,
    },
    link: {
      ...DEFAULT_CTA_LINK_STYLES,
      ...value?.link,
    },
  } satisfies NearbyCtaStyles;
  const showButtonStyles = resolvedValue.variant !== "link";

  return (
    <YextAutoField
      field={{
        type: "object",
        label: field.label,
        objectFields: {
          variant: {
            type: "radio",
            label: "Variant",
            options: [
              { label: "Solid", value: "primary" },
              { label: "Outline", value: "secondary" },
              { label: "Link", value: "link" },
            ],
          },
          color: {
            type: "basicSelector",
            label: "Color",
            options: "SITE_COLOR",
          },
          button: {
            type: "custom",
            label: "Button Styles",
            visible: showButtonStyles,
            render: renderCtaButtonStylesFieldWithoutBorderRadius,
          },
          link: {
            type: "styledLink",
            label: "Link Styles",
            visible: !showButtonStyles,
          },
        },
      }}
      value={resolvedValue}
      onChange={onChange}
    />
  );
}

function getCssStyleValue(value: string | undefined): string | undefined {
  return value && value !== "default" ? value : undefined;
}

function getResolvedCtaStyles(
  styles: NearbyCtaStyles | undefined,
  defaultStyles: NearbyCtaStyles,
): NearbyCtaStyles {
  return {
    ...defaultStyles,
    ...styles,
    button: {
      ...DEFAULT_CTA_BUTTON_STYLES,
      ...defaultStyles.button,
      ...styles?.button,
    },
    link: {
      ...DEFAULT_CTA_LINK_STYLES,
      ...defaultStyles.link,
      ...styles?.link,
    },
  };
}

function getNearbyCtaClassName(styles: NearbyCtaStyles): string {
  return [
    "boutique-nearby__cta",
    `boutique-nearby__cta--${styles.variant}`,
  ].join(" ");
}

function getNearbyCtaStyle(
  styles: NearbyCtaStyles,
  cardBackgroundColor: string,
  cardForegroundColor: string,
): React.CSSProperties {
  const color = getThemeColorCssValue(styles.color) ?? cardForegroundColor;
  const textColor =
    getThemeColorCssValue(styles.color?.contrastingColor) ??
    cardBackgroundColor;
  const textStyles = styles.variant === "link" ? styles.link : styles.button;

  return {
    "--nearby-cta-color": color,
    "--nearby-cta-text": textColor,
    fontFamily: getCssStyleValue(textStyles?.fontFamily),
    fontSize: getCssStyleValue(textStyles?.fontSize),
    fontStyle: getCssStyleValue(textStyles?.fontStyle),
    fontWeight: getCssStyleValue(textStyles?.fontWeight),
    letterSpacing: getCssStyleValue(textStyles?.letterSpacing),
    textTransform: getCssStyleValue(textStyles?.textTransform),
  } as React.CSSProperties;
}


const NearbyComponent: PuckComponent<BoutiqueShopNearbyProps> = (props) => {
  const streamDocument = useDocument<StoreDocument>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const cardStyles = props.cardStyles ?? defaultNearbyCardStyles;
  const locale = streamDocument.locale ?? "en";

  const coordinate = streamDocument?.yextDisplayCoordinate;
  const shouldLoadNearby = Boolean(
    props.section.visibleOnLivePage &&
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    props.radiusMiles > 0 &&
    props.limit > 0,
  );

  const { data, status } = useNearbyLocations({
    enabled: shouldLoadNearby,
    latitude: coordinate?.latitude,
    limit: props.limit,
    longitude: coordinate?.longitude,
    radiusMi: props.radiusMiles,
    streamDocument,
  });

  const nearbyDocs = data?.response?.docs?.slice(0, props.limit) ?? [];
  const resolvedHeading =
    resolveComponentData(
      props.heading.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedIntro = resolveComponentData(
    props.introText.text as any,
    locale,
    streamDocument as any,
  );
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";

  if (!shouldLoadNearby) {
    return <></>;
  }

  const message =
    status === "pending"
      ? "Loading nearby locations"
      : "No nearby locations found for this location";
  const shouldShowMessage =
    status === "pending" ||
    (props.puck.isEditing && (status !== "success" || nearbyDocs.length === 0));

  if (!shouldShowMessage && (status !== "success" || nearbyDocs.length === 0)) {
    return <></>;
  }

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopNearby${getAnalyticsScopeHash(props.id ?? "nearby")}`}
    >
      <Background
        as="section"
        background={props.section.backgroundColor}
        className="boutique-nearby"
        style={sectionSurfaceStyle}
      >
        <style>{NEARBY_STYLES}</style>
        <div className="boutique-nearby__shell">
          <EntityField
            displayName="Heading"
            fieldId={props.heading.text.field}
            constantValueEnabled={props.heading.text.constantValueEnabled}
          >
            <h2
              className="boutique-nearby__heading"
              style={{
                color: resolveFontColor(
                  props.heading.fontColor,
                  sectionForeground,
                ),
                fontFamily: props.heading.styles.fontFamily,
                fontSize: props.heading.styles.fontSize,
                fontStyle: props.heading.styles.fontStyle,
                fontWeight: props.heading.styles.fontWeight,
                textTransform: props.heading.styles.textTransform,
              }}
            >
              {resolvedHeading}
            </h2>
          </EntityField>
          <EntityField
            displayName="Intro Text"
            fieldId={props.introText.text.field}
            constantValueEnabled={props.introText.text.constantValueEnabled}
          >
            <div
              className="boutique-nearby__map"
              style={{
                color: resolveFontColor(
                  props.introText.fontColor,
                  sectionForeground,
                ),
              }}
            >
              {renderRichText(resolvedIntro)}
            </div>
          </EntityField>
          {shouldShowMessage ? (
            <div
              className="boutique-nearby__meta"
              style={{
                marginTop: 24,
              }}
            >
              {message}
            </div>
          ) : (
            <ul className="boutique-nearby__grid">
              {nearbyDocs.map((location, index) => {
                const directionsUrl = buildDirectionsUrl(location.address);
                const storeUrl = resolveUrlTemplate(
                  mergeMeta(location, streamDocument),
                  relativePrefixToRoot ?? "",
                );
                const cardSurfaceStyle = getSurfaceColorStyle(
                  cardStyles.cardBackgroundColor,
                  streamDocument,
                );
                const cardBackgroundColor =
                  cardSurfaceStyle?.backgroundColor ??
                  resolveThemeColor(
                    typeof cardStyles.cardBackgroundColor === "string"
                      ? undefined
                      : cardStyles.cardBackgroundColor,
                    typeof cardStyles.cardBackgroundColor === "string"
                      ? cardStyles.cardBackgroundColor
                      : "hsl(from var(--colors-palette-tertiary) h s 96)",
                  );
                const cardForegroundColor =
                  cardSurfaceStyle?.color ??
                  resolveFontColor(
                    cardStyles.cardTitleColor,
                    sectionForeground,
                  );
                const storeCtaStyles = getResolvedCtaStyles(
                  cardStyles.storeCtaStyles,
                  defaultStoreCtaStyles,
                );
                const directionsCtaStyles = getResolvedCtaStyles(
                  cardStyles.directionsCtaStyles,
                  defaultDirectionsCtaStyles,
                );
                const storeCtaValue: Partial<ComprehensiveCTAValue> = {
                  data: {
                    actionType: "link",
                    cta: {
                      field: "",
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          defaultValue: "View Store",
                          hasLocalizedValue: "true",
                        },
                        link: storeUrl,
                        linkType: "URL",
                      },
                      constantValueEnabled: true,
                    },
                    openInNewTab: false,
                  },
                  styles: {
                    variant: storeCtaStyles.variant,
                    color: storeCtaStyles.color,
                    button: storeCtaStyles.button,
                    link: storeCtaStyles.link,
                  },
                };
                const directionsCtaValue: Partial<ComprehensiveCTAValue> = {
                  data: {
                    actionType: "link",
                    cta: {
                      field: "",
                      constantValue: {
                        ctaType: "textAndLink",
                        label: {
                          defaultValue: "Get Directions",
                          hasLocalizedValue: "true",
                        },
                        link: directionsUrl ?? "#",
                        linkType: "URL",
                      },
                      constantValueEnabled: true,
                    },
                    openInNewTab: false,
                  },
                  styles: {
                    variant: directionsCtaStyles.variant,
                    color: directionsCtaStyles.color,
                    button: directionsCtaStyles.button,
                    link: directionsCtaStyles.link,
                  },
                };

                return (
                  <li
                    key={`${location.name ?? "nearby"}-${index}`}
                    className="boutique-nearby__card"
                    style={
                      {
                        "--card-background": cardBackgroundColor,
                        "--card-foreground": cardForegroundColor,
                        background: cardBackgroundColor,
                        color: cardForegroundColor,
                      } as React.CSSProperties
                    }
                  >
                    <h3
                      className="boutique-nearby__card-title"
                      style={{
                        color: resolveFontColor(
                          cardStyles.cardTitleColor,
                          cardForegroundColor,
                        ),
                      }}
                    >
                      {location.name ?? "Nearby Location"}
                    </h3>
                    <div className="boutique-nearby__contact boutique-nearby__meta">
                      {cardStyles.showAddress && location.address ? (
                        <Address
                          address={location.address}
                          showRegion={cardStyles.address.showRegion}
                          showCountry={cardStyles.address.showCountry}
                        />
                      ) : null}
                      {cardStyles.showPhone && location.mainPhone ? (
                        <PhoneAtom
                          phoneNumber={location.mainPhone}
                          format={cardStyles.phone.phoneFormat}
                          includeHyperlink={
                            cardStyles.phone.includeHyperlink ?? true
                          }
                          includeIcon={false}
                        />
                      ) : null}
                      {cardStyles.showHours && location.hours ? (
                        <HoursStatusAtom
                          hours={location.hours as HoursType}
                          className="boutique-nearby__hours"
                          comingSoon={location.comingSoon}
                          showCurrentStatus={
                            cardStyles.hoursStyles.showCurrentStatus
                          }
                          timeFormat={cardStyles.hoursStyles.timeFormat}
                          dayOfWeekFormat={
                            cardStyles.hoursStyles.dayOfWeekFormat
                          }
                          showDayNames={cardStyles.hoursStyles.showDayNames}
                          timezone={location.timezone}
                          bodyVariant="sm"
                        />
                      ) : null}
                    </div>
                    <ComprehensiveCTA
                      alwaysHideCaret={storeCtaStyles.variant !== "link"}
                      className={getNearbyCtaClassName(storeCtaStyles)}
                      style={getNearbyCtaStyle(
                        storeCtaStyles,
                        cardBackgroundColor,
                        cardForegroundColor,
                      )}
                      value={storeCtaValue}
                    />
                    {directionsUrl ? (
                      <ComprehensiveCTA
                        alwaysHideCaret={directionsCtaStyles.variant !== "link"}
                        className={getNearbyCtaClassName(directionsCtaStyles)}
                        style={getNearbyCtaStyle(
                          directionsCtaStyles,
                          cardBackgroundColor,
                          cardForegroundColor,
                        )}
                        value={directionsCtaValue}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Background>
    </AnalyticsScopeProvider>
  );
};

const nearbyFields: YextFields<BoutiqueShopNearbyProps> = {
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
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  introText: {
    label: "Intro Text",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.rich_text_v2"] },
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  radiusMiles: {
    label: "Radius Miles",
    type: "number",
  },
  limit: {
    label: "Limit",
    type: "number",
  },
  cardStyles: {
    label: "Card Styles",
    type: "object",
    objectFields: {
      cardBackgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardTitleColor: {
        label: "Title Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      storeCtaStyles: {
        label: "View Store CTA",
        type: "custom",
        render: renderNearbyCtaStylesField,
      },
      directionsCtaStyles: {
        label: "Directions CTA",
        type: "custom",
        render: renderNearbyCtaStylesField,
      },
      showAddress: {
        label: "Show Address",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showPhone: {
        label: "Show Phone",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showHours: {
        label: "Show Hours",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      hoursStyles: {
        label: "Hours Styles",
        type: "object",
        objectFields: {
          showCurrentStatus: {
            label: "Show Current Status",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          timeFormat: {
            label: "Time Format",
            type: "select",
            options: [
              { label: "12 Hour", value: "12h" },
              { label: "24 Hour", value: "24h" },
            ],
          },
          dayOfWeekFormat: {
            label: "Day Of Week Format",
            type: "select",
            options: [
              { label: "Short", value: "short" },
              { label: "Long", value: "long" },
            ],
          },
          showDayNames: {
            label: "Show Day Names",
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
          phoneFormat: {
            label: "Phone Number Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Phone Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      address: {
        label: "Address",
        type: "object",
        objectFields: {
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
    },
  },
};

const makeTextDefault = (
  value: string,
  styles?: Partial<StyledTextValue>,
  fontColor?: string | ThemeColor,
): StyledTextProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: value,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  styles: {
    fontFamily: "inherit",
    fontSize: "16px",
    fontWeight: "400",
    fontStyle: "normal",
    textTransform: "none",
    ...styles,
  },
  fontColor,
});

const makeRtfDefault = (
  value: string,
  fontColor?: string | ThemeColor,
): StyledRtfProps => ({
  text: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(value),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  fontColor,
});

export const BoutiqueShopNearby: YextComponentConfig<BoutiqueShopNearbyProps> =
  {
    label: "Nearby",
    fields: nearbyFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: makeTextDefault("Nearby Stores", {
        fontSize: "25px",
        fontWeight: "500",
      }),
      introText: makeRtfDefault(
        "Explore more [[name]] locations nearby with quick access to each store page and directions.",
      ),
      radiusMiles: 10,
      limit: 3,
      cardStyles: defaultNearbyCardStyles,
    },
    render: (props) => <NearbyComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopNearby",
  displayName: "Nearby",
  description: "Nearby",
  pageSetTypes: ["ENTITY"],
};
