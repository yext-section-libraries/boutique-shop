import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  Address,
  AnalyticsScopeProvider,
  HoursTable,
  Link,
  type AddressType,
  type DayOfWeekNames,
  type HoursType,
} from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import {
  isPresetImageCta,
  renderComprehensiveCtaFieldWithoutBorderRadius,
} from "../shared/comprehensiveCta";
import { buildDirectionsUrl } from "../shared/sectionStyles";

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type TextStyleProps = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type StyledTextProps = TextStyleProps & {
  text: YextEntityField<TranslatableString>;
};

type TextOnlyProps = {
  text: YextEntityField<TranslatableString>;
};

type StyledTextListProps = {
  text: YextEntityField<TranslatableString[]>;
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

type HoursTableStyles = {
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
};

type BoutiqueShopStoreDetailsProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  bodyText: TextStyleProps;
  columnHeadingStyles: TextStyleProps;
  websiteUrl: ComprehensiveCTAValue;
  services: StyledTextListProps;
  address: AddressFieldProps;
  mainPhone: PhoneFieldProps;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursTableStyles;
  locationInformationHeading: TextOnlyProps;
  addressLabel: StyledTextProps;
  mainPhoneLabel: StyledTextProps;
  storeHoursHeading: TextOnlyProps;
  servicesHeading: TextOnlyProps;
  directionsCta: ComprehensiveCTAValue;
};

type StoreDocument = {
  address?: AddressType;
  additionalHoursText?: string;
  comingSoon?: boolean;
  hours?: HoursType;
  locale?: string;
  mainPhone?: string;
  timezone?: string;
  websiteUrl?: string;
};

const DETAILS_STYLES = `
.boutique-details {
  padding: 72px 0;
}

.boutique-details p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-details li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-details h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-details h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-details h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-details h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-details h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-details h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-details a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-details__shell {
  margin: 0 auto;
  max-width: 1540px;
  padding: 0 24px;
}

.boutique-details__heading {
  margin: 0 0 clamp(1.5rem, 2vw, 2.25rem);
  text-align: center;
}

.boutique-details__grid {
  display: grid;
  column-gap: 48px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  row-gap: 1.5rem;
}

.boutique-details__grid > article {
  grid-column: span 4;
  min-height: 100%;
}

.boutique-details__grid > article h3 {
  line-height: 1.08;
  margin: 0 0 1.5rem;
}

.boutique-details__label {
  display: block;
  line-height: 1.4;
  margin: 0 0 0.4rem;
}

.boutique-details__value {
  line-height: 1.7;
  margin: 0 0 1.35rem;
}

.boutique-details__body-content {
  color: inherit;
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  font-style: var(--fontStyle-body-fontStyle);
  font-weight: var(--fontWeight-body-fontWeight);
  line-height: 1.5;
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-details__value > *:last-child {
  margin-bottom: 0;
}

.boutique-details__body-content p {
  margin: 0;
}

.boutique-details__value .address-line + .address-line {
  margin-top: 0.1rem;
}

.boutique-details__body-content .address-line,
.boutique-details__body-content .address-line span,
.boutique-details__body-content .address-line abbr,
.boutique-details__body-content p,
.boutique-details__body-content .HoursTable,
.boutique-details__body-content .HoursTable-row,
.boutique-details__body-content .HoursTable-day,
.boutique-details__body-content .HoursTable-intervals,
.boutique-details__body-content .HoursTable-interval,
.boutique-details__body-content li {
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-transform: inherit;
}

.boutique-details .boutique-details__body-content a,
.boutique-details .boutique-details__body-content p a {
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-transform: inherit;
}

.boutique-details__buttons {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.boutique-details__button,
.boutique-details__button a {
  align-items: center;
  border-radius: 0 !important;
  display: inline-flex !important;
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
  width: fit-content;
}

.boutique-details__button--primary,
.boutique-details__button--primary:visited {
  background: var(--button-bg) !important;
  border: 1px solid var(--button-text) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-text) !important;
}

.boutique-details__button--secondary,
.boutique-details__button--secondary:visited {
  background: transparent !important;
  border: 1px solid var(--button-bg) !important;
  box-shadow: 6px 6px 0 var(--button-bg) !important;
  color: var(--button-bg) !important;
}

.boutique-details__button--primary:hover,
.boutique-details__button--primary:focus-visible,
.boutique-details__button--secondary:hover,
.boutique-details__button--secondary:focus-visible {
  box-shadow: none !important;
  transform: translate(6px, 6px);
}

.boutique-details__button--link,
.boutique-details__button--link:visited {
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

.boutique-details__buttons .boutique-details__button--link,
.boutique-details__buttons .boutique-details__button--link:visited {
  align-self: center;
  min-height: 48px;
  padding: 0 !important;
}

.boutique-details__button--link::after {
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

.boutique-details__button--link:hover,
.boutique-details__button--link:focus-visible {
  box-shadow: none !important;
  color: var(--button-bg) !important;
  opacity: 0.82;
  text-decoration: none !important;
  transform: none !important;
}

.boutique-details__button--link:hover::after,
.boutique-details__button--link:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

.boutique-details__services,
.boutique-details__hours {
  display: grid;
  gap: 0.8rem;
  margin: 0;
  padding-left: 0;
}

.boutique-details__hours .HoursTable-row {
  gap: 1rem;
  justify-content: space-between;
}

.boutique-details__hours .HoursTable-day,
.boutique-details__hours .HoursTable-intervals,
.boutique-details__hours .HoursTable-interval {
  flex: 0 0 auto;
}

.boutique-details__hours .HoursTable-intervals {
  align-items: flex-end;
}

.boutique-details__services {
  gap: 0.9rem;
}

.boutique-details__services li {
  line-height: 1.6;
  padding-left: 0.2rem;
}

@media (min-width: 1024px) {
  .boutique-details__hours {
    padding-right: 32px;
  }
}

@media (max-width: 1023px) {
  .boutique-details {
    padding: 64px 0;
  }

  .boutique-details__grid {
    row-gap: 48px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .boutique-details__shell {
    padding: 0 18px;
  }

  .boutique-details__grid > article:nth-of-type(1),
  .boutique-details__grid > article:nth-of-type(2) {
    grid-column: span 6;
  }

  .boutique-details__grid > article:nth-of-type(3) {
    grid-column: span 12;
  }
}

@media (max-width: 767px) {
  .boutique-details__shell {
    padding: 0 18px;
  }

  .boutique-details__grid {
    column-gap: 0;
    grid-template-columns: 1fr;
    row-gap: 48px;
  }

  .boutique-details__grid > article {
    grid-column: auto;
  }

  .boutique-details__buttons {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.85rem;
    margin-top: 0;
    padding-bottom: 20px;
  }

  .boutique-details__hours .HoursTable-row {
    align-items: flex-start;
  }
}
`;

function getCssStyleValue(value: string | undefined): string | undefined {
  return value && value !== "default" ? value : undefined;
}

function textStyle(value: TextStyleProps): React.CSSProperties {
  return {
    ...(getThemeColorCssValue(value.fontColor)
      ? { color: getThemeColorCssValue(value.fontColor) }
      : {}),
    fontFamily: getCssStyleValue(value.styles.fontFamily),
    fontSize: getCssStyleValue(value.styles.fontSize),
    fontStyle: getCssStyleValue(value.styles.fontStyle),
    fontWeight: getCssStyleValue(value.styles.fontWeight),
    textTransform: getCssStyleValue(value.styles.textTransform),
  };
}


function formatPhoneNumber(
  phoneNumberString: string,
  format: "international" | "domestic",
) {
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

function normalizeServicesList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (
    value &&
    typeof value === "object" &&
    "defaultValue" in value &&
    Array.isArray(value.defaultValue)
  ) {
    return value.defaultValue.filter(
      (item): item is string => typeof item === "string",
    );
  }

  return [];
}

const StoreDetailsComponent: PuckComponent<
  BoutiqueShopStoreDetailsProps
> = (props) => {
  const streamDocument = useDocument<StoreDocument>();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";

  const resolvedHeading =
    resolveComponentData(
      props.heading.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedLocationHeading =
    resolveComponentData(
      props.locationInformationHeading.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedAddressLabel =
    resolveComponentData(
      props.addressLabel.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedMainPhoneLabel =
    resolveComponentData(
      props.mainPhoneLabel.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedStoreHoursHeading =
    resolveComponentData(
      props.storeHoursHeading.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedServicesHeading =
    resolveComponentData(
      props.servicesHeading.text as any,
      locale,
      streamDocument as any,
    ) || "";
  const resolvedServices =
    resolveComponentData(
      props.services.text as any,
      locale,
      streamDocument as any,
    ) || [];
  const normalizedServices = normalizeServicesList(
    Array.isArray(resolvedServices)
      ? resolvedServices
      : props.services.text.constantValueEnabled
        ? props.services.text.constantValue
        : resolvedServices,
  );
  const resolvedAddress = resolveComponentData(
    props.address.address,
    locale,
    streamDocument,
  );
  const directionsUrl = buildDirectionsUrl(resolvedAddress);
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const resolvedPhoneItems: ResolvedPhoneItem[] = (props.mainPhone.items ?? [])
    .map((item): ResolvedPhoneItem | null => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const normalizedLabel = item.label?.trim() ?? "";

      if (!normalizedNumber) {
        return null;
      }

      return {
        constantValueEnabled: item.number.constantValueEnabled,
        fieldId: item.number.field,
        formattedNumber: formatPhoneNumber(
          normalizedNumber,
          props.mainPhone.phoneFormat,
        ),
        key: `${normalizedLabel}-${normalizedNumber}`,
        label: normalizedLabel,
        telDigits: normalizedNumber.replace(/\D/g, ""),
      };
    })
    .filter((item): item is ResolvedPhoneItem => item !== null);
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  );
  const directionsCtaValue = directionsUrl
    ? ({
        ...props.directionsCta,
        data: {
          ...props.directionsCta.data,
          cta: {
            ...(props.directionsCta.data?.cta ?? { field: "" }),
            constantValue: {
              ...(props.directionsCta.data?.cta?.constantValue ?? {
                ctaType: "getDirections",
                label: { defaultValue: "Get Directions" },
              }),
              link: directionsUrl,
            },
          },
        },
      } as Partial<ComprehensiveCTAValue>)
    : undefined;
  const websiteCtaVariant =
    props.websiteUrl.styles?.variant === "secondary" ||
    props.websiteUrl.styles?.variant === "link"
      ? props.websiteUrl.styles.variant
      : "primary";
  const websiteCtaExplicitColor = getThemeColorCssValue(
    props.websiteUrl.styles?.color,
  );
  const websiteCtaColor =
    websiteCtaExplicitColor ??
    (websiteCtaVariant === "primary" ? "#262b2c" : sectionForeground);
  const websiteCtaTextColor =
    getThemeColorCssValue(props.websiteUrl.styles?.color?.contrastingColor) ??
    "#ffffff";
  const directionsCtaVariant =
    props.directionsCta.styles?.variant === "secondary" ||
    props.directionsCta.styles?.variant === "link"
      ? props.directionsCta.styles.variant
      : "primary";
  const directionsCtaExplicitColor = getThemeColorCssValue(
    props.directionsCta.styles?.color,
  );
  const directionsCtaColor =
    directionsCtaExplicitColor ??
    (directionsCtaVariant === "primary" ? "#262b2c" : sectionForeground);
  const directionsCtaTextColor =
    getThemeColorCssValue(
      props.directionsCta.styles?.color?.contrastingColor,
    ) ?? "#ffffff";
  const isWebsitePresetImage = isPresetImageCta(props.websiteUrl);
  const isDirectionsPresetImage = isPresetImageCta(directionsCtaValue);
  const renderedWebsiteCtaValue = isWebsitePresetImage
    ? ({
        ...props.websiteUrl,
        styles: {
          presetImage: props.websiteUrl.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : (props.websiteUrl as Partial<ComprehensiveCTAValue>);
  const renderedDirectionsCtaValue = isDirectionsPresetImage
    ? ({
        ...directionsCtaValue,
        styles: {
          presetImage: directionsCtaValue?.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : directionsCtaValue;
  const bodyTextStyle = textStyle(props.bodyText);
  const columnHeadingStyle = textStyle(props.columnHeadingStyles);

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopStoreDetails${getAnalyticsScopeHash(props.id ?? "details")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-details"
          style={sectionSurfaceStyle}
        >
          <style>{DETAILS_STYLES}</style>
          <div className="boutique-details__shell">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="boutique-details__heading"
                style={textStyle(props.heading)}
              >
                {resolvedHeading}
              </h2>
            </EntityField>
            <div className="boutique-details__grid">
              <article>
                <EntityField
                  displayName="Location Information Heading"
                  fieldId={props.locationInformationHeading.text.field}
                  constantValueEnabled={
                    props.locationInformationHeading.text.constantValueEnabled
                  }
                >
                  <h3 style={columnHeadingStyle}>{resolvedLocationHeading}</h3>
                </EntityField>
                <EntityField
                  displayName="Address Label"
                  fieldId={props.addressLabel.text.field}
                  constantValueEnabled={
                    props.addressLabel.text.constantValueEnabled
                  }
                >
                  <span
                    className="boutique-details__label"
                    style={textStyle(props.addressLabel)}
                  >
                    {resolvedAddressLabel}
                  </span>
                </EntityField>
                <div
                  className="boutique-details__value boutique-details__body-content"
                  style={bodyTextStyle}
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
                </div>
                <EntityField
                  displayName="Main Phone Label"
                  fieldId={props.mainPhoneLabel.text.field}
                  constantValueEnabled={
                    props.mainPhoneLabel.text.constantValueEnabled
                  }
                >
                  <span
                    className="boutique-details__label"
                    style={textStyle(props.mainPhoneLabel)}
                  >
                    {resolvedMainPhoneLabel}
                  </span>
                </EntityField>
                <div
                  className="boutique-details__value boutique-details__body-content"
                  style={bodyTextStyle}
                >
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
                        {!props.mainPhone.includeHyperlink ||
                        !item.telDigits ? (
                          <p>{content}</p>
                        ) : (
                          <p>
                            <Link
                              cta={{
                                label: content,
                                link: item.telDigits,
                                linkType: "PHONE",
                              }}
                            />
                          </p>
                        )}
                      </EntityField>
                    );
                  })}
                </div>
                <div className="boutique-details__buttons">
                  <EntityField
                    displayName="Website Call to Action"
                    fieldId={props.websiteUrl.data.cta.field}
                    constantValueEnabled={
                      props.websiteUrl.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      alwaysHideCaret={
                        isWebsitePresetImage
                          ? undefined
                          : websiteCtaVariant !== "link"
                      }
                      className={
                        isWebsitePresetImage
                          ? undefined
                          : [
                              "boutique-details__button",
                              `boutique-details__button--${websiteCtaVariant}`,
                            ].join(" ")
                      }
                      style={
                        isWebsitePresetImage
                          ? undefined
                          : ({
                              "--button-bg": websiteCtaColor,
                              "--button-text": websiteCtaTextColor,
                            } as React.CSSProperties)
                      }
                      value={renderedWebsiteCtaValue}
                    />
                  </EntityField>
                  {directionsCtaValue ? (
                    <EntityField
                      displayName="Directions Call to Action"
                      fieldId={props.directionsCta.data.cta.field}
                      constantValueEnabled={
                        props.directionsCta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        alwaysHideCaret={
                          isDirectionsPresetImage
                            ? undefined
                            : directionsCtaVariant !== "link"
                        }
                        className={
                          isDirectionsPresetImage
                            ? undefined
                            : [
                                "boutique-details__button",
                                `boutique-details__button--${directionsCtaVariant}`,
                              ].join(" ")
                        }
                        style={
                          isDirectionsPresetImage
                            ? undefined
                            : ({
                                "--button-bg": directionsCtaColor,
                                "--button-text": directionsCtaTextColor,
                              } as React.CSSProperties)
                        }
                        value={renderedDirectionsCtaValue}
                      />
                    </EntityField>
                  ) : null}
                </div>
              </article>
              <article>
                <EntityField
                  displayName="Store Hours Heading"
                  fieldId={props.storeHoursHeading.text.field}
                  constantValueEnabled={
                    props.storeHoursHeading.text.constantValueEnabled
                  }
                >
                  <h3 style={columnHeadingStyle}>
                    {resolvedStoreHoursHeading}
                  </h3>
                </EntityField>
                <div
                  className="boutique-details__value boutique-details__body-content"
                  style={bodyTextStyle}
                >
                  {resolvedHours ? (
                    <EntityField
                      displayName="Hours"
                      fieldId={props.hours.field}
                      constantValueEnabled={props.hours.constantValueEnabled}
                    >
                      <div
                        className={`boutique-details__hours flex flex-col ${props.hoursStyles.alignment}`}
                      >
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          startOfWeek={props.hoursStyles.startOfWeek}
                          collapseDays={props.hoursStyles.collapseDays}
                        />
                        {props.hoursStyles.showAdditionalHoursText &&
                        additionalHoursText ? (
                          <p>{additionalHoursText}</p>
                        ) : null}
                      </div>
                    </EntityField>
                  ) : null}
                </div>
              </article>
              <article>
                <EntityField
                  displayName="Services Heading"
                  fieldId={props.servicesHeading.text.field}
                  constantValueEnabled={
                    props.servicesHeading.text.constantValueEnabled
                  }
                >
                  <h3 style={columnHeadingStyle}>{resolvedServicesHeading}</h3>
                </EntityField>
                <EntityField
                  displayName="Services"
                  fieldId={props.services.text.field}
                  constantValueEnabled={
                    props.services.text.constantValueEnabled
                  }
                >
                  <ul
                    className="boutique-details__services boutique-details__body-content"
                    style={bodyTextStyle}
                  >
                    {normalizedServices.map((service, index) => (
                      <li key={`${service}-${index}`}>{service}</li>
                    ))}
                  </ul>
                </EntityField>
              </article>
            </div>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const detailsFields = {
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
  websiteUrl: {
    label: "Website CTA",
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  bodyText: {
    label: "Body Text",
    type: "object",
    objectFields: {
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
  columnHeadingStyles: {
    label: "Column Heading Styles",
    type: "object",
    objectFields: {
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
  services: {
    label: "Services",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text List",
        filter: { types: ["type.string"], includeListsOnly: true },
      },
    },
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
  mainPhone: {
    label: "Main Phone",
    type: "object",
    objectFields: {
      items: {
        label: "Items",
        type: "array",
        arrayFields: {
          number: {
            type: "entityField",
            label: "Number",
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
          number: {
            field: "",
            constantValue: "",
            constantValueEnabled: true,
          } as YextEntityField<string>,
          label: "",
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
          { label: "Domestic", value: "domestic" },
          { label: "International", value: "international" },
        ],
      },
      includeHyperlink: {
        label: "Include Hyperlink",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  hours: {
    type: "entityField",
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      startOfWeek: {
        label: "Start Of Week",
        type: "select",
        options: [
          { label: "Monday", value: "monday" },
          { label: "Tuesday", value: "tuesday" },
          { label: "Wednesday", value: "wednesday" },
          { label: "Thursday", value: "thursday" },
          { label: "Friday", value: "friday" },
          { label: "Saturday", value: "saturday" },
          { label: "Sunday", value: "sunday" },
          { label: "Today", value: "today" },
        ],
      },
      collapseDays: {
        label: "Collapse Days",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showAdditionalHoursText: {
        label: "Show Additional Hours Text",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      alignment: {
        label: "Alignment",
        type: "select",
        options: [
          { label: "Start", value: "items-start" },
          { label: "Center", value: "items-center" },
          { label: "End", value: "items-end" },
        ],
      },
    },
  },
  locationInformationHeading: {
    label: "Location Information Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
    },
  },
  addressLabel: {
    label: "Address Label",
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
  mainPhoneLabel: {
    label: "Main Phone Label",
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
  storeHoursHeading: {
    label: "Store Hours Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
    },
  },
  servicesHeading: {
    label: "Services Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
    },
  },
  directionsCta: {
    label: "Directions CTA",
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
} as YextFields<BoutiqueShopStoreDetailsProps>;

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

export const BoutiqueShopStoreDetails: YextComponentConfig<BoutiqueShopStoreDetailsProps> =
  {
    label: "Store Details",
    fields: detailsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: makeTextDefault("[[name]] Store Details", {
        fontSize: "25px",
        fontWeight: "500",
      }),
      bodyText: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      columnHeadingStyles: {
        styles: {
          fontFamily: "inherit",
          fontSize: "26px",
          fontWeight: "700",
          fontStyle: "normal",
          textTransform: "none",
        },
        fontColor: undefined,
      },
      services: {
        text: {
          field: "",
          constantValue: [
            "Complimentary Personal Styling",
            "Digital Fitting Room Requests",
            "In-Store WiFi",
            "Mobile Checkout",
            "Gift Wrapping Station",
          ],
          constantValueEnabled: true,
        },
      },
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
        showCountry: false,
      },
      mainPhone: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "",
              constantValueEnabled: false,
            } as YextEntityField<string>,
            label: "",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      } as YextEntityField<HoursType>,
      hoursStyles: {
        startOfWeek: "monday",
        collapseDays: false,
        showAdditionalHoursText: false,
        alignment: "items-start",
      },
      locationInformationHeading: {
        text: makeTextDefault("Location Information").text,
      },
      addressLabel: makeTextDefault("Address", {
        fontSize: "16px",
        fontWeight: "700",
      }),
      mainPhoneLabel: makeTextDefault("Main Phone", {
        fontSize: "16px",
        fontWeight: "700",
      }),
      storeHoursHeading: {
        text: makeTextDefault("Store Hours").text,
      },
      servicesHeading: {
        text: makeTextDefault("Services").text,
      },
      directionsCta: {
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
          variant: "secondary",
        },
      },
      websiteUrl: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: { defaultValue: "Visit Website" },
              ctaType: "textAndLink",
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
    },
    render: (props) => <StoreDetailsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopStoreDetails",
  displayName: "Store Details",
  description: "Store Details",
  pageSetTypes: ["ENTITY"],
};
