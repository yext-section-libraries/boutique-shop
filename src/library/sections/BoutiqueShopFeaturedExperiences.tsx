import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  ComprehensiveCTAValue,
  createItemSource,
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
  type EnhancedTranslatableCTA,
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
  renderCtaStylesFieldWithoutBorderRadius,
} from "../shared/comprehensiveCta";
import {
  renderRichText,
  resolveFontColor,
} from "../shared/sectionStyles";

type ThemeSection = {
  visibleOnLivePage: boolean;
  backgroundColor: ThemeColor;
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

type CardTitleStyles = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type CardDescriptionStyles = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type CardImageStyles = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type ExperienceCardFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: YextEntityField<EnhancedTranslatableCTA>;
  image: YextEntityField<TranslatableAssetImage>;
};

type FeaturedExperienceCardStyles = {
  title: CardTitleStyles;
  description: CardDescriptionStyles;
  cta: ComprehensiveCTAValue["styles"];
  image: CardImageStyles;
};

type BoutiqueShopFeaturedExperiencesProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  experienceCards: {
    data: typeof experienceCardsSource.value;
    styles: FeaturedExperienceCardStyles;
  };
};

const EXPERIENCE_IMAGES = [
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
  "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
  "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
];

const FEATURE_STYLES = `
.boutique-featured {
  padding: 96px 0;
}

.boutique-featured p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-featured li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-featured h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-featured h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-featured h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-featured h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-featured h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-featured h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-featured a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-featured__shell {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
}

.boutique-featured__heading {
  margin: 0 0 40px;
  line-height: 1.2;
}

.boutique-featured__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 16px;
}

.boutique-featured__card {
  min-width: 0;
}

.boutique-featured__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.boutique-featured__content {
  display: grid;
  gap: 12px;
  padding: 28px 10px 10px;
  text-align: center;
}

.boutique-featured__content h3,
.boutique-featured__content p {
  margin: 0;
}

.boutique-events__button {
  align-items: center;
  border-radius: 0 !important;
  display: inline-flex !important;
  font-size: 0.78rem;
  font-weight: 700;
  justify-self: center;
  margin-left: auto;
  margin-right: auto;
  letter-spacing: 0.08em;
  min-height: 52px;
  padding: 0 24px;
  width: fit-content;
  text-decoration: none !important;
  text-transform: uppercase;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
}

.boutique-events__button a,
.boutique-events__button button {
  color: inherit !important;
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
  .boutique-featured {
    padding: 64px 0;
  }

  .boutique-featured__shell {
    padding: 0 18px;
  }

  .boutique-featured__grid {
    grid-template-columns: 1fr;
  }
}
`;


function renderImage(
  image: TranslatableAssetImage | undefined,
  imageStyles: CardImageStyles,
) {
  const resolvedImageUrl =
    image && typeof image === "object"
      ? "image" in image &&
        image.image &&
        typeof image.image === "object" &&
        "url" in image.image &&
        typeof image.image.url === "string" &&
        image.image.url.trim()
        ? image.image.url
        : "url" in image && typeof image.url === "string" && image.url.trim()
          ? image.url
          : undefined
      : undefined;

  const maxImageHeight = 520;
  const imageAspectRatio =
    imageStyles.aspectRatio > 0 ? imageStyles.aspectRatio : undefined;
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio: imageAspectRatio,
    borderRadius:
      imageStyles.styles?.borderRadius === "default"
        ? undefined
        : imageStyles.styles?.borderRadius,
    marginLeft: "auto",
    marginRight: "auto",
    maxHeight: `${maxImageHeight}px`,
    maxWidth: imageAspectRatio
      ? `min(100%, ${maxImageHeight * imageAspectRatio}px)`
      : "100%",
    width: "100%",
    overflow:
      imageStyles.imageConstrain === "filled" ||
      Boolean(
        imageStyles.styles?.borderRadius &&
        imageStyles.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: imageAspectRatio ? "100%" : "auto",
    objectFit: imageStyles.imageConstrain === "filled" ? "cover" : "contain",
  };

  return (
    <div style={imageWrapperStyle}>
      {resolvedImageUrl && image ? (
        <Image image={image} className="h-full" style={imageStyle} />
      ) : null}
    </div>
  );
}

function makeTextDefault(
  value: string,
  styles?: Partial<StyledTextValue>,
  fontColor?: string | ThemeColor,
): StyledTextProps {
  return {
    text: {
      field: "",
      constantValue: {
        defaultValue: value,
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    } as any,
    styles: {
      fontFamily: "inherit",
      fontSize: "16px",
      fontWeight: "400",
      fontStyle: "normal",
      textTransform: "none",
      ...styles,
    } as StyledTextValue,
    ...(fontColor ? { fontColor } : {}),
  };
}

function makeRtfDefault(
  value: string,
  fontColor?: string | ThemeColor,
): StyledRtfProps {
  return {
    text: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(value),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    } as any,
    ...(fontColor ? { fontColor } : {}),
  };
}

function makeImageDefault(
  url: string,
): YextEntityField<TranslatableAssetImage> {
  return {
    field: "",
    constantValue: {
      url,
      width: 1267,
      height: 1900,
    },
    constantValueEnabled: true,
  } as any;
}

function makeCta(label: string): YextEntityField<EnhancedTranslatableCTA> {
  return {
    field: "",
    constantValue: {
      label: {
        defaultValue: label,
        hasLocalizedValue: "true",
      },
      link: {
        defaultValue: "#",
        hasLocalizedValue: "true",
      },
      linkType: "URL",
      ctaType: "textAndLink",
    },
    constantValueEnabled: true,
  };
}

function makeExperienceCard(
  title: string,
  description: string,
  ctaLabel: string,
  imageUrl: string,
): ExperienceCardFields {
  return {
    title: makeTextDefault(title).text,
    description: makeRtfDefault(description).text,
    cta: makeCta(ctaLabel),
    image: makeImageDefault(imageUrl),
  };
}

const experienceCardsSource = createItemSource<ExperienceCardFields>({
  label: "Experience Cards",
  mappingFields: {
    title: {
      label: "Title",
      type: "entityField",
      filter: { types: ["type.string"] },
    },
    description: {
      label: "Description",
      type: "entityField",
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      label: "Call to Action",
      type: "entityField",
      filter: { types: ["type.cta"] },
    },
    image: {
      label: "Image",
      type: "entityField",
      filter: { types: ["type.image"] },
    },
  },
  defaultValues: [
    makeExperienceCard(
      "Personal Styling",
      "Work one-on-one with a style expert to refresh your wardrobe or find the perfect outfit for a special event.",
      "Book a Free Session",
      EXPERIENCE_IMAGES[0],
    ),
    makeExperienceCard(
      "Premium Denim Lab",
      "Find your perfect fit with specialized denim consultants and on-site tailoring for hem adjustments.",
      "Browse Denim Collection",
      EXPERIENCE_IMAGES[1],
    ),
    makeExperienceCard(
      "Buy Online, Pick Up In-Store",
      "Skip the shipping and get your items today. Simply select [[name]] at checkout.",
      "Start Shopping",
      EXPERIENCE_IMAGES[2],
    ),
    makeExperienceCard(
      "Alterations & Tailoring",
      "Ensure every piece fits perfectly with our on-site tailor providing professional adjustments.",
      "View Tailoring Menu",
      EXPERIENCE_IMAGES[3],
    ),
  ],
});

function makeCardTitleStylesDefault(): CardTitleStyles {
  return {
    styles: {
      fontFamily: "inherit",
      fontSize: "24px",
      fontWeight: "700",
      fontStyle: "normal",
      textTransform: "none",
    },
  };
}

function makeCardDescriptionStylesDefault(): CardDescriptionStyles {
  return {
    styles: {
      fontFamily: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
      fontStyle: "normal",
      textTransform: "none",
    },
  };
}

function makeCardCtaStylesDefault(): ComprehensiveCTAValue["styles"] {
  return {
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
  };
}

function makeCardImageStylesDefault(): CardImageStyles {
  return {
    aspectRatio: 1.3,
    imageConstrain: "filled",
    styles: {
      borderRadius: "default",
    },
  };
}

const FeaturedExperiencesComponent: PuckComponent<
  BoutiqueShopFeaturedExperiencesProps
> = (props) => {
  const streamDocument = useDocument();
  const resolvedLocale = streamDocument.locale ?? "en";
  const sectionSurfaceStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionSurfaceStyle?.color ?? "#000000";
  const resolvedExperienceCards = experienceCardsSource.resolveItems(
    props.experienceCards.data,
    streamDocument,
  );

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopFeaturedExperiences${getAnalyticsScopeHash(
        props.id ?? "experiences",
      )}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-featured"
          style={sectionSurfaceStyle}
        >
          <style>{FEATURE_STYLES}</style>
          <div className="boutique-featured__shell">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="boutique-featured__heading"
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
                {resolveComponentData(
                  props.heading.text as any,
                  resolvedLocale,
                  streamDocument,
                ) || ""}
              </h2>
            </EntityField>
            <EntityField
              displayName="Experience Cards"
              fieldId={props.experienceCards.data.field}
              constantValueEnabled={
                props.experienceCards.data.constantValueEnabled
              }
            >
              <div className="boutique-featured__grid">
                {resolvedExperienceCards.map((card, index) => {
                  const resolvedTitle =
                    resolveComponentData(
                      card.title,
                      resolvedLocale,
                      streamDocument,
                      { output: "plainText" },
                    ) || "";
                  const descriptionStyleOverrides = {
                    ...props.experienceCards.styles.description.styles,
                    color: props.experienceCards.styles.description.fontColor,
                  };
                  const resolvedDescription = card.description
                    ? resolveComponentData(
                        card.description,
                        resolvedLocale,
                        streamDocument,
                      )
                    : undefined;
                  const ctaVariant =
                    props.experienceCards.styles.cta.variant === "secondary" ||
                    props.experienceCards.styles.cta.variant === "link"
                      ? props.experienceCards.styles.cta.variant
                      : "primary";
                  const ctaExplicitColor = getThemeColorCssValue(
                    props.experienceCards.styles.cta.color,
                  );
                  const ctaColor =
                    ctaExplicitColor ??
                    (ctaVariant === "primary" ? "#262b2c" : sectionForeground);
                  const ctaTextColor =
                    getThemeColorCssValue(
                      props.experienceCards.styles.cta.color?.contrastingColor,
                    ) ?? "#ffffff";

                  return (
                    <article
                      key={`experience-${index}`}
                      className="boutique-featured__card"
                    >
                      <div className="boutique-featured__media">
                        {renderImage(
                          card.image,
                          props.experienceCards.styles.image,
                        )}
                      </div>
                      <div className="boutique-featured__content">
                        <h3
                          style={{
                            color: resolveFontColor(
                              props.experienceCards.styles.title.fontColor,
                              sectionForeground,
                            ),
                            fontFamily:
                              props.experienceCards.styles.title.styles
                                .fontFamily,
                            fontSize:
                              props.experienceCards.styles.title.styles
                                .fontSize,
                            fontStyle:
                              props.experienceCards.styles.title.styles
                                .fontStyle,
                            fontWeight:
                              props.experienceCards.styles.title.styles
                                .fontWeight,
                            textTransform:
                              props.experienceCards.styles.title.styles
                                .textTransform,
                          }}
                        >
                          {resolvedTitle}
                        </h3>
                        <div
                          style={{
                            fontFamily:
                              props.experienceCards.styles.description.styles
                                .fontFamily,
                            fontSize:
                              props.experienceCards.styles.description.styles
                                .fontSize,
                            fontStyle:
                              props.experienceCards.styles.description.styles
                                .fontStyle,
                            fontWeight:
                              props.experienceCards.styles.description.styles
                                .fontWeight,
                            textTransform:
                              props.experienceCards.styles.description.styles
                                .textTransform,
                            color: resolveFontColor(
                              props.experienceCards.styles.description
                                .fontColor,
                              sectionForeground,
                            ),
                          }}
                        >
                          {renderRichText(
                            resolvedDescription,
                            descriptionStyleOverrides,
                          )}
                        </div>
                        {card.cta
                          ? (() => {
                              const ctaValue = {
                                data: {
                                  actionType: "link" as const,
                                  cta: {
                                    field: "",
                                    constantValue: card.cta,
                                    constantValueEnabled: true,
                                    selectedType:
                                      card.cta.ctaType ?? "textAndLink",
                                  },
                                  openInNewTab: card.cta.openInNewTab ?? false,
                                },
                                styles: props.experienceCards.styles.cta,
                              } as Partial<ComprehensiveCTAValue>;
                              const isPresetImage = isPresetImageCta(ctaValue);
                              const renderedCtaValue = isPresetImage
                                ? ({
                                    ...ctaValue,
                                    styles: {
                                      presetImage:
                                        ctaValue.styles?.presetImage ??
                                        "app-store",
                                    },
                                  } as Partial<ComprehensiveCTAValue>)
                                : ctaValue;

                              return (
                                <ComprehensiveCTA
                                  alwaysHideCaret={
                                    isPresetImage
                                      ? undefined
                                      : ctaVariant !== "link"
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
                                      : ({
                                          "--button-bg": ctaColor,
                                          "--button-text": ctaTextColor,
                                        } as React.CSSProperties)
                                  }
                                  value={renderedCtaValue}
                                />
                              );
                            })()
                          : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const experienceFields = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
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
  experienceCards: {
    label: "Experience Cards",
    type: "object",
    objectFields: {
      data: experienceCardsSource.field,
      styles: {
        label: "Card Styles",
        type: "object",
        objectFields: {
          title: {
            label: "Title",
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
          description: {
            label: "Description",
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
          cta: {
            label: "CTA",
            type: "custom",
            render: renderCtaStylesFieldWithoutBorderRadius,
          },
          image: {
            label: "Image",
            type: "object",
            objectFields: {
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
        },
      },
    },
  },
} satisfies YextFields<BoutiqueShopFeaturedExperiencesProps>;

export const BoutiqueShopFeaturedExperiences: YextComponentConfig<BoutiqueShopFeaturedExperiencesProps> =
  {
    label: "Featured Experiences",
    fields: experienceFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
      },
      heading: makeTextDefault("Featured Shopping Experiences", {
        fontSize: "25px",
        fontWeight: "500",
        textTransform: "none",
      }),
      experienceCards: {
        data: experienceCardsSource.defaultValue,
        styles: {
          title: makeCardTitleStylesDefault(),
          description: makeCardDescriptionStylesDefault(),
          cta: makeCardCtaStylesDefault(),
          image: makeCardImageStylesDefault(),
        },
      },
    } as BoutiqueShopFeaturedExperiencesProps,
    render: (props) => <FeaturedExperiencesComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopFeaturedExperiences",
  displayName: "Featured Experiences",
  description: "Featured Experiences",
  pageSetTypes: ["ENTITY"],
};
