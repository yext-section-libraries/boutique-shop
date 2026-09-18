import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { TFunction } from "i18next";
import {
  AnalyticsScopeProvider,
  HoursStatus,
  type AddressType,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  MaybeRTF,
  ReviewStars,
  msg,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { ImageStylingFields } from "../shared/components/contentBlocks/image/styling";
import {
  isPresetImageCta,
  renderComprehensiveCtaFieldWithoutBorderRadius,
} from "../shared/comprehensiveCta";
import {
  buildDirectionsUrl,
  resolveExplicitColor,
} from "../shared/sectionStyles";

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type HoursStatusStyles = {
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
};

type HoursStatusProps = {
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStatusStyles;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: string | ThemeColor;
};

type HeroImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BoutiqueShopHeroProps = {
  id?: string;
  section: ThemeSection;
  statusText: HoursStatusProps;
  name: StyledTextProps;
  description: StyledRtfProps;
  reviewStarsColor?: ThemeColor;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  heroImage: HeroImageProps;
};

type StoreDocument = {
  address?: AddressType;
  description?: string;
  hours?: HoursType;
  comingSoon?: boolean;
  locale?: string;
  name?: string;
  timezone?: string;
  ref_reviewsAgg?: unknown[];
};

const DEFAULT_HERO_IMAGE = {
  url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
  width: 1900,
  height: 1267,
};

const HERO_STYLES = `
.boutique-hero {
  padding: 72px 0;
}

.boutique-hero p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-hero li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-hero h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-hero h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-hero h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-hero h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-hero h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-hero h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-hero a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-hero__shell {
  align-items: start;
  display: grid;
  gap: 32px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0 auto;
  max-width: 1540px;
  padding: 0 24px;
}

.boutique-hero__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.boutique-hero__status,
.boutique-hero__copy,
.boutique-hero__title {
  margin: 0;
}

.boutique-hero__statusChip {
  align-items: center;
  display: inline-flex;
  gap: 8px;
}

.boutique-hero__statusDot {
  border-radius: 999px;
  flex: 0 0 auto;
  height: 8px;
  width: 8px;
}

.boutique-hero__statusDot--open {
  background-color: #2f9e44;
}

.boutique-hero__statusDot--closed {
  background-color: #d64545;
}

.boutique-hero__statusDot--comingSoon {
  background-color: #8b8b8b;
}

.boutique-hero__rating {
  align-items: center;
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.boutique-hero__stars {
  display: inline-flex;
  gap: 4px;
}

.boutique-hero__stars svg {
  width: 18px;
}

.boutique-hero__buttons {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.boutique-hero__button,
.boutique-hero__button a {
  align-items: center;
  border-radius: 0 !important;
  display: inline-flex !important;
  font-size: 0.78rem;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0.08em;
  min-height: 56px;
  padding: 0 28px;
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

.boutique-hero__button--primary,
.boutique-hero__button--primary:visited {
  background: var(--button-bg) !important;
  border: 1px solid var(--button-text) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-text) !important;
}

.boutique-hero__button--secondary,
.boutique-hero__button--secondary:visited {
  background: transparent !important;
  border: 1px solid var(--button-bg) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-bg) !important;
}

.boutique-hero__button--primary:hover,
.boutique-hero__button--primary:focus-visible,
.boutique-hero__button--secondary:hover,
.boutique-hero__button--secondary:focus-visible {
  box-shadow: none !important;
  transform: translate(6px, 6px);
}

.boutique-hero__button--link,
.boutique-hero__button--link:visited {
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

.boutique-hero__buttons .boutique-hero__button--link,
.boutique-hero__buttons .boutique-hero__button--link:visited {
  align-self: center;
  min-height: 56px;
  padding: 0 !important;
}

.boutique-hero__button--link::after {
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

.boutique-hero__button--link:hover,
.boutique-hero__button--link:focus-visible {
  box-shadow: none !important;
  color: var(--button-bg) !important;
  opacity: 0.82;
  text-decoration: none !important;
  transform: none !important;
}

.boutique-hero__button--link:hover::after,
.boutique-hero__button--link:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

.boutique-hero__media img {
  width: 100%;
}

@media (max-width: 1024px) {
  .boutique-hero {
    padding: 64px 0;
  }

  .boutique-hero__shell {
    grid-template-columns: 1fr;
    padding: 0 18px;
  }
}
`;


function isOpen24h(params: StatusParams): boolean {
  return params.currentInterval?.is24h?.() || false;
}

function isIndefinitelyClosed(params: StatusParams): boolean {
  return !params.futureInterval;
}

function getStatusDotClassName(params: StatusParams): string {
  if (params.comingSoon) {
    return "boutique-hero__statusDot boutique-hero__statusDot--comingSoon";
  }

  return params.isOpen
    ? "boutique-hero__statusDot boutique-hero__statusDot--open"
    : "boutique-hero__statusDot boutique-hero__statusDot--closed";
}

function getHeroCurrentStatusText(
  params: StatusParams,
  t: TFunction,
): string {
  if (params.comingSoon) {
    return t("comingSoon", "Coming Soon");
  }

  if (isOpen24h(params)) {
    return t("open24Hours", "Open 24 Hours");
  }

  if (isIndefinitelyClosed(params)) {
    return t("temporarilyClosed", "Temporarily Closed");
  }

  return params.isOpen
    ? t("openNow", "Open Now")
    : t("closed", "Closed");
}

function getStatusSeparator(params: StatusParams): React.ReactNode {
  if (params.comingSoon || isOpen24h(params) || isIndefinitelyClosed(params)) {
    return null;
  }

  return <span className="boutique-hero__statusText"> • </span>;
}

const HeroComponent: PuckComponent<BoutiqueShopHeroProps> = (props) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<StoreDocument>();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";

  const directionsUrl = buildDirectionsUrl(streamDocument?.address);
  const ratingSummary = getAggregateRating(streamDocument);
  const resolvedHours = resolveComponentData(
    props.statusText.hours,
    locale,
    streamDocument,
  ) as HoursType | undefined;
  const resolvedName = resolveComponentData(props.name.text, locale, streamDocument);
  const descriptionColor = getThemeColorCssValue(props.description.fontColor);
  const descriptionRichTextStyleOverrides = descriptionColor
    ? { color: descriptionColor }
    : undefined;
  const resolvedDescription = resolveComponentData(
    props.description.text,
    locale,
    streamDocument,
  );
  const descriptionContent = React.isValidElement(resolvedDescription) ? (
    resolvedDescription
  ) : (
    <MaybeRTF
      data={resolvedDescription as string | undefined}
      richTextStyleOverrides={descriptionRichTextStyleOverrides}
    />
  );
  const resolvedImage = resolveComponentData(
    props.heroImage?.image,
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
  const hasRatingSummary = Boolean(
    ratingSummary?.averageRating && ratingSummary.reviewCount,
  );
  const primaryCtaValue = directionsUrl
    ? ({
        ...props.primaryCta,
        data: {
          ...props.primaryCta.data,
          cta: {
            ...(props.primaryCta.data?.cta ?? { field: "" }),
            constantValue: {
              ...(props.primaryCta.data?.cta?.constantValue ?? {
                ctaType: "getDirections",
                label: { defaultValue: "Get Directions" },
              }),
              link: directionsUrl,
            },
          },
        },
      } as Partial<ComprehensiveCTAValue>)
    : undefined;
  const primaryCtaVariant =
    props.primaryCta.styles?.variant === "secondary" ||
    props.primaryCta.styles?.variant === "link"
      ? props.primaryCta.styles.variant
      : "primary";
  const primaryCtaExplicitColor = getThemeColorCssValue(props.primaryCta.styles?.color);
  const primaryCtaColor =
    primaryCtaExplicitColor ??
    (primaryCtaVariant === "primary" ? "#262b2c" : sectionForeground);
  const primaryCtaTextColor =
    getThemeColorCssValue(props.primaryCta.styles?.color?.contrastingColor) ??
    "#ffffff";
  const secondaryCtaVariant =
    props.secondaryCta.styles?.variant === "secondary" ||
    props.secondaryCta.styles?.variant === "link"
      ? props.secondaryCta.styles.variant
      : "primary";
  const secondaryCtaExplicitColor = getThemeColorCssValue(
    props.secondaryCta.styles?.color,
  );
  const secondaryCtaColor =
    secondaryCtaExplicitColor ??
    (secondaryCtaVariant === "primary" ? "#262b2c" : sectionForeground);
  const secondaryCtaTextColor =
    getThemeColorCssValue(props.secondaryCta.styles?.color?.contrastingColor) ??
    "#ffffff";
  const isPrimaryPresetImage = isPresetImageCta(primaryCtaValue);
  const isSecondaryPresetImage = isPresetImageCta(props.secondaryCta);
  const renderedPrimaryCtaValue = isPrimaryPresetImage
    ? ({
        ...primaryCtaValue,
        styles: {
          presetImage: primaryCtaValue?.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : primaryCtaValue;
  const renderedSecondaryCtaValue = isSecondaryPresetImage
    ? ({
        ...props.secondaryCta,
        styles: {
          presetImage: props.secondaryCta.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : (props.secondaryCta as Partial<ComprehensiveCTAValue>);
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio:
      props.heroImage.aspectRatio > 0 ? props.heroImage.aspectRatio : undefined,
    borderRadius:
      props.heroImage.styles?.borderRadius === "default"
        ? undefined
        : props.heroImage.styles?.borderRadius,
    overflow:
      props.heroImage.imageConstrain === "filled" ||
      Boolean(
        props.heroImage.styles?.borderRadius &&
          props.heroImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: props.heroImage.aspectRatio > 0 ? "100%" : "auto",
    objectFit: props.heroImage.imageConstrain === "filled" ? "cover" : "contain",
  };
  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopHero${getAnalyticsScopeHash(props.id ?? "hero")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-hero"
          style={sectionSurfaceStyle}
        >
          <style>{HERO_STYLES}</style>
          <div className="boutique-hero__shell">
            <div className="boutique-hero__content">
              {resolvedHours ? (
                <EntityField
                  displayName="Hours"
                  fieldId={props.statusText.hours.field}
                  constantValueEnabled={props.statusText.hours.constantValueEnabled}
                >
                  <HoursStatus
                    className="boutique-hero__status"
                    hours={resolvedHours}
                    comingSoon={streamDocument.comingSoon}
                    timezone={streamDocument.timezone ?? "America/New_York"}
                    dayOptions={{
                      weekday: props.statusText.hoursStyles.dayOfWeekFormat,
                    }}
                    timeOptions={{
                      hour12: props.statusText.hoursStyles.timeFormat === "12h",
                    }}
                    statusTemplate={(status: StatusParams) => {
                      const isFuture =
                        !status.comingSoon &&
                        !isOpen24h(status) &&
                        !isIndefinitelyClosed(status);
                      const interval = status.isOpen
                        ? status.currentInterval
                        : status.futureInterval;
                      const time = status.isOpen
                        ? (interval?.getEndTime(locale, status.timeOptions) ?? "")
                        : (interval?.getStartTime(locale, status.timeOptions) ?? "");
                      const showDayOfWeek =
                        props.statusText.hoursStyles.showDayNames && isFuture;
                      const dayOfWeek = showDayOfWeek
                        ? status.isOpen
                          ? (interval?.end
                              ?.setLocale(locale)
                              .toLocaleString(status.dayOptions) ?? "")
                          : (interval?.start
                              ?.setLocale(locale)
                              .toLocaleString(status.dayOptions) ?? "")
                        : "";

                      let futureStatusText = "";
                      if (isFuture && status.isOpen) {
                        futureStatusText = dayOfWeek
                          ? t(
                              "closesAtTimeOnDay",
                              "Closes at {{time}} {{dayOfWeek}}",
                              { time, dayOfWeek },
                            )
                          : t("closesAtTime", "Closes at {{time}}", {
                              time,
                            });
                      }

                      if (isFuture && !status.isOpen) {
                        futureStatusText = dayOfWeek
                          ? t(
                              "opensAtTimeOnDay",
                              "Opens at {{time}} {{dayOfWeek}}",
                              { time, dayOfWeek },
                            )
                          : t("opensAtTime", "Opens at {{time}}", { time });
                      }

                      return (
                        <span className="boutique-hero__statusChip">
                          {props.statusText.hoursStyles.showCurrentStatus ? (
                            <>
                              <span
                                aria-hidden="true"
                                className={getStatusDotClassName(status)}
                              />
                              <span className="boutique-hero__statusText">
                                {getHeroCurrentStatusText(status, t)}
                              </span>
                            </>
                          ) : null}
                          {props.statusText.hoursStyles.showCurrentStatus
                            ? getStatusSeparator(status)
                            : null}
                          {futureStatusText ? (
                            <span className="boutique-hero__statusText">
                              {futureStatusText}
                            </span>
                          ) : null}
                        </span>
                      );
                    }}
                  />
                </EntityField>
              ) : null}
              <EntityField
                displayName="Name"
                fieldId={props.name.text.field}
                constantValueEnabled={props.name.text.constantValueEnabled}
              >
                <h1
                  className="boutique-hero__title"
                  style={{
                    ...resolveExplicitColor(props.name.fontColor),
                    fontFamily: props.name.styles.fontFamily,
                    fontSize: props.name.styles.fontSize,
                    fontStyle: props.name.styles.fontStyle,
                    fontWeight: props.name.styles.fontWeight,
                    textTransform: props.name.styles.textTransform,
                  }}
                >
                  {resolvedName ?? ""}
                </h1>
              </EntityField>
              {hasRatingSummary ? (
                <div className="boutique-hero__rating">
                  <ReviewStars
                    averageRating={ratingSummary?.averageRating ?? 5}
                    color={props.reviewStarsColor}
                  />
                  <span>
                    {t("ratingFromReviews", {
                      defaultValue: "{{rating}} Stars | {{count}} Reviews",
                      rating: ratingSummary?.averageRating.toFixed(1),
                      count: ratingSummary?.reviewCount,
                    })}
                  </span>
                </div>
              ) : null}
              <div className="boutique-hero__copy">
                <EntityField
                  displayName="Description"
                  fieldId={props.description.text.field}
                  constantValueEnabled={props.description.text.constantValueEnabled}
                >
                  {descriptionContent}
                </EntityField>
              </div>
              <div className="boutique-hero__buttons">
                {primaryCtaValue ? (
                  <EntityField
                    displayName="Primary Call to Action"
                    fieldId={props.primaryCta.data.cta.field}
                    constantValueEnabled={
                      props.primaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      alwaysHideCaret={
                        isPrimaryPresetImage
                          ? undefined
                          : primaryCtaVariant !== "link"
                      }
                      className={
                        isPrimaryPresetImage
                          ? undefined
                          : [
                              "boutique-hero__button",
                              `boutique-hero__button--${primaryCtaVariant}`,
                            ].join(" ")
                      }
                      style={
                        isPrimaryPresetImage
                          ? undefined
                          : ({
                              "--button-bg": primaryCtaColor,
                              "--button-text": primaryCtaTextColor,
                            } as React.CSSProperties)
                      }
                      value={renderedPrimaryCtaValue}
                    />
                  </EntityField>
                ) : null}
                <EntityField
                  displayName="Secondary Call to Action"
                  fieldId={props.secondaryCta.data.cta.field}
                  constantValueEnabled={
                    props.secondaryCta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    alwaysHideCaret={
                      isSecondaryPresetImage
                        ? undefined
                        : secondaryCtaVariant !== "link"
                    }
                    className={
                      isSecondaryPresetImage
                        ? undefined
                        : [
                            "boutique-hero__button",
                            `boutique-hero__button--${secondaryCtaVariant}`,
                          ].join(" ")
                    }
                    style={
                      isSecondaryPresetImage
                        ? undefined
                        : ({
                            "--button-bg": secondaryCtaColor,
                            "--button-text": secondaryCtaTextColor,
                          } as React.CSSProperties)
                    }
                    value={renderedSecondaryCtaValue}
                  />
                </EntityField>
              </div>
            </div>
            <div className="boutique-hero__media">
              <EntityField
                displayName="Hero Image"
                fieldId={props.heroImage?.image.field}
                constantValueEnabled={props.heroImage?.image.constantValueEnabled}
              >
                <div style={imageWrapperStyle}>
                  {resolvedImageUrl ? (
                    <Image
                      image={resolvedImage as any}
                      className="h-full"
                      style={imageStyle}
                    />
                  ) : null}
                </div>
              </EntityField>
            </div>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const heroFields: YextFields<BoutiqueShopHeroProps> = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  statusText: {
    label: msg("fields.status", "Status"),
    type: "object",
    objectFields: {
      hours: {
        type: "entityField",
        label: msg("fields.hours", "Hours"),
        filter: {
          types: ["type.hours"],
        },
        disableConstantValueToggle: true,
      },
      hoursStyles: {
        label: msg("fields.hoursStyles", "Hours Styles"),
        type: "object",
        objectFields: {
          showCurrentStatus: {
            label: msg("fields.showCurrentStatus", "Show Current Status"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
          timeFormat: {
            label: msg("fields.timeFormat", "Time Format"),
            type: "select",
            options: [
              { label: msg("fields.options.hour12Label", "12 Hour"), value: "12h" },
              { label: msg("fields.options.hour24Label", "24 Hour"), value: "24h" },
            ],
          },
          dayOfWeekFormat: {
            label: msg("fields.dayOfWeekFormatLabel", "Day Of Week Format"),
            type: "select",
            options: [
              { label: msg("fields.options.short", "Short"), value: "short" },
              { label: msg("fields.options.long", "Long"), value: "long" },
            ],
          },
          showDayNames: {
            label: msg("fields.showDayNames", "Show Day Names"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
        },
      },
    },
  },
  name: {
    label: msg("fields.name", "Name"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  description: {
    label: msg("fields.description", "Description"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.rich_text_v2"] },
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  reviewStarsColor: {
    label: msg("fields.reviewStarsColor", "Review Stars Color"),
    type: "basicSelector",
    options: "SITE_COLOR",
  },
  primaryCta: {
    label: msg("fields.primaryCTA", "Primary CTA"),
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  secondaryCta: {
    label: msg("fields.secondaryCTA", "Secondary CTA"),
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  heroImage: {
    label: msg("fields.heroImage", "Hero Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
      aspectRatio: ImageStylingFields.aspectRatio,
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select",
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
      },
      styles: {
        label: msg("fields.imageStyles", "Image Styles"),
        type: "styledImage",
      },
    },
  },
};

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
  ...(fontColor ? { fontColor } : {}),
});

export const BoutiqueShopHero: YextComponentConfig<BoutiqueShopHeroProps> =
  {
    label: "Hero",
    fields: heroFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-tertiary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      statusText: {
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        } as YextEntityField<HoursType>,
        hoursStyles: {
          showCurrentStatus: true,
          timeFormat: "12h",
          dayOfWeekFormat: "long",
          showDayNames: true,
        },
      },
      name: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
          },
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "inherit",
          fontSize: "56px",
          fontWeight: "700",
          fontStyle: "normal",
          textTransform: "none",
        },
      },
      description: makeRtfDefault(
        "[[name]] is a clothing retail location offering curated contemporary apparel, premium denim, and seasonal essentials for men, women, and children with personalized styling services and designer-inspired fashion for Chicago.",
      ),
      reviewStarsColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      primaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: { defaultValue: "Get Directions" },
              ctaType: "getDirections",
              link: "#",
            },
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
            letterSpacing: "default"
          },
        },
      },
      secondaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: { defaultValue: "Book Personal Stylist" },
              ctaType: "textAndLink",
              link: "#",
            },
          },
          openInNewTab: false,
        },
        styles: {
          variant: "secondary",
        },
      },
      heroImage: {
        image: {
          field: "",
          constantValue: DEFAULT_HERO_IMAGE,
          constantValueEnabled: true,
        },
        aspectRatio: 1.5,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
    },
    render: (props) => <HeroComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
