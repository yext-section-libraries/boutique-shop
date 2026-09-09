import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
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
import { ImageStylingFields } from "../shared/components/contentBlocks/image/styling";
import {
  isPresetImageCta,
  renderComprehensiveCtaFieldWithoutBorderRadius,
} from "../shared/comprehensiveCta";
import { renderRichText, resolveExplicitColor } from "../shared/sectionStyles";

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

type EventImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BoutiqueShopEventsProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  body: StyledRtfProps;
  cta: ComprehensiveCTAValue;
  eventImage: EventImageProps;
};

const DEFAULT_EVENT_IMAGE = {
  url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
  width: 1267,
  height: 1900,
};

const EVENT_STYLES = `
.boutique-events {
  padding: 72px 0;
}

.boutique-events p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-events li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-events h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-events h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-events h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-events h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-events h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-events h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-events a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-events__shell {
  align-items: stretch;
  display: grid;
  gap: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0 auto;
  max-width: 1540px;
  min-height: 500px;
  padding: 0 24px;
}

.boutique-events__image {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.boutique-events__card {
  align-content: start;
  display: grid;
  gap: 12px;
  padding: 48px;
}

.boutique-events__card h2 {
  letter-spacing: 0.06em;
  line-height: 1.08;
  margin: 0;
}

.boutique-events__card p {
  margin: 0;
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
  .boutique-events {
    padding: 64px 0;
  }

  .boutique-events__shell {
    grid-template-columns: 1fr;
    padding: 0 18px;
  }

  .boutique-events__card {
    padding: 32px 24px;
  }
}
`;


const EventsComponent: PuckComponent<BoutiqueShopEventsProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";

  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    streamDocument,
  );
  const resolvedImage = resolveComponentData(
    props.eventImage?.image,
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
  const ctaVariant =
    props.cta.styles?.variant === "secondary" ||
    props.cta.styles?.variant === "link"
      ? props.cta.styles.variant
      : "primary";
  const ctaExplicitColor = getThemeColorCssValue(props.cta.styles?.color);
  const ctaColor =
    ctaExplicitColor ??
    (ctaVariant === "primary" ? "#262b2c" : sectionForeground);
  const ctaTextColor =
    getThemeColorCssValue(props.cta.styles?.color?.contrastingColor) ??
    "#ffffff";
  const isPresetImage = isPresetImageCta(props.cta);
  const renderedCtaValue = isPresetImage
    ? ({
        ...props.cta,
        styles: {
          presetImage: props.cta.styles?.presetImage ?? "app-store",
        },
      } as Partial<ComprehensiveCTAValue>)
    : (props.cta as Partial<ComprehensiveCTAValue>);
  const imageAspectRatio =
    props.eventImage.aspectRatio > 0 ? props.eventImage.aspectRatio : undefined;
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
      props.eventImage.styles?.borderRadius === "default"
        ? undefined
        : props.eventImage.styles?.borderRadius,
    height: imageAspectRatio ? undefined : "500px",
    maxHeight: "500px",
    maxWidth: imageAspectRatio
      ? `min(100%, ${500 * imageAspectRatio}px)`
      : "100%",
    overflow:
      props.eventImage.imageConstrain === "filled" ||
      Boolean(
        props.eventImage.styles?.borderRadius &&
        props.eventImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
    width: "100%",
  };

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopEvents${getAnalyticsScopeHash(props.id ?? "events")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-events"
          style={sectionSurfaceStyle}
        >
          <style>{EVENT_STYLES}</style>
          <div className="boutique-events__shell">
            <EntityField
              displayName="Event Image"
              fieldId={props.eventImage?.image.field}
              constantValueEnabled={
                props.eventImage?.image.constantValueEnabled
              }
            >
              <div style={imageFrameStyle}>
                <div style={imageWrapperStyle}>
                  {resolvedImageUrl ? (
                    <Image
                      image={resolvedImage as any}
                      className="boutique-events__image"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit:
                          props.eventImage.imageConstrain === "filled"
                            ? "cover"
                            : "contain",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </EntityField>
            <article
              className="boutique-events__card"
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
                  {resolvedHeading}
                </h2>
              </EntityField>
              <EntityField
                displayName="Body"
                fieldId={props.body.text.field}
                constantValueEnabled={props.body.text.constantValueEnabled}
              >
                <div style={resolveExplicitColor(props.body.fontColor)}>
                  {renderRichText(resolvedBody)}
                </div>
              </EntityField>
              <EntityField
                displayName="Call to Action"
                fieldId={props.cta.data.cta.field}
                constantValueEnabled={props.cta.data.cta.constantValueEnabled}
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
                          "mr-auto",
                        ].join(" ")
                  }
                  style={
                    isPresetImage
                      ? undefined
                      : ({
                          "--button-bg": ctaColor,
                          "--button-text": ctaTextColor,
                        } as React.CSSProperties)
                  }
                  value={renderedCtaValue}
                />
              </EntityField>
            </article>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const eventsFields: YextFields<BoutiqueShopEventsProps> = {
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
  body: {
    label: "Body",
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
  cta: {
    label: "Call to Action",
    type: "custom",
    render: renderComprehensiveCtaFieldWithoutBorderRadius,
  },
  eventImage: {
    label: "Event Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
      },
      aspectRatio: ImageStylingFields.aspectRatio,
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
};

export const BoutiqueShopEvents: YextComponentConfig<BoutiqueShopEventsProps> =
  {
    label: "Events",
    fields: eventsFields,
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
          constantValue: {
            defaultValue: "Community & Events",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "inherit",
          fontSize: "25px",
          fontWeight: "500",
          fontStyle: "normal",
          textTransform: "none",
        },
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "[[name]] hosts monthly style workshops and seasonal trend previews. Join our local mailing list to receive invitations to private shopping nights and early access to sales.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
      },
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: { defaultValue: "Join Mailing List" },
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
      } satisfies ComprehensiveCTAValue,
      eventImage: {
        image: {
          field: "",
          constantValue: DEFAULT_EVENT_IMAGE,
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
    },
    render: (props) => <EventsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopEvents",
  displayName: "Events",
  description: "Events",
  pageSetTypes: ["ENTITY"],
};
