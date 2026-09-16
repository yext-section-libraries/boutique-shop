import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  Image,
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
import { ImageStylingFields } from "../shared/components/contentBlocks/image/styling";
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

type AboutImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type BoutiqueShopAboutProps = {
  id?: string;
  section: ThemeSection;
  cardBackgroundColor?: ThemeColor;
  heading: StyledTextProps;
  body: StyledRtfProps;
  aboutImage: AboutImageProps;
};

const defaultAboutCardBackgroundColor: ThemeColor = {
  selectedColor: "palette-primary-light",
  contrastingColor: "black",
};

const DEFAULT_ABOUT_IMAGE = {
  url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
  width: 1267,
  height: 1900,
};

const ABOUT_STYLES = `
.boutique-about {
  padding: 72px 0;
}

.boutique-about p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-about li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-about h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-about h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-about h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-about h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-about h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-about h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-about a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-about__shell {
  align-items: stretch;
  display: grid;
  gap: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0 auto;
  max-width: 1540px;
  min-height: 500px;
  padding: 0 24px;
}

.boutique-about__card {
  align-content: start;
  display: grid;
  gap: 18px;
  padding: 48px;
}

.boutique-about__card h2 {
  font-size: 1.7rem;
  letter-spacing: 0.06em;
  line-height: 1.08;
  margin: 0;
}

.boutique-about__copy {
  line-height: 1.75;
  margin: 0;
}

.boutique-about__image {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

@media (max-width: 1024px) {
  .boutique-about {
    padding: 64px 0;
  }

  .boutique-about__shell {
    grid-template-columns: 1fr;
    padding: 0 18px;
  }

  .boutique-about__card {
    padding: 32px 24px;
  }
}
`;


const AboutComponent: PuckComponent<BoutiqueShopAboutProps> = (props) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";

  const resolvedHeadingText =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const resolvedImage = resolveComponentData(
    props.aboutImage?.image,
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
    props.aboutImage.aspectRatio > 0 ? props.aboutImage.aspectRatio : undefined;
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
      props.aboutImage.styles?.borderRadius === "default"
        ? undefined
        : props.aboutImage.styles?.borderRadius,
    height: imageAspectRatio ? undefined : "500px",
    maxHeight: "500px",
    maxWidth: imageAspectRatio
      ? `min(100%, ${500 * imageAspectRatio}px)`
      : "100%",
    overflow:
      props.aboutImage.imageConstrain === "filled" ||
      Boolean(
        props.aboutImage.styles?.borderRadius &&
        props.aboutImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
    width: "100%",
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit:
      props.aboutImage.imageConstrain === "filled" ? "cover" : "contain",
  };
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    streamDocument,
  );

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopAbout${getAnalyticsScopeHash(props.id ?? "about")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-about"
          style={getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          )}
        >
          <style>{ABOUT_STYLES}</style>
          <div className="boutique-about__shell">
            <article
              className="boutique-about__card"
              style={getSurfaceColorStyle(
                props.cardBackgroundColor ?? defaultAboutCardBackgroundColor,
                streamDocument,
              )}
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
                  {resolvedHeadingText}
                </h2>
              </EntityField>
              <EntityField
                displayName="Body"
                fieldId={props.body.text.field}
                constantValueEnabled={props.body.text.constantValueEnabled}
              >
                <div
                  className="boutique-about__copy"
                  style={resolveExplicitColor(props.body.fontColor)}
                >
                  {renderRichText(resolvedBody)}
                </div>
              </EntityField>
            </article>
            <EntityField
              displayName="About Image"
              fieldId={props.aboutImage?.image.field}
              constantValueEnabled={
                props.aboutImage?.image.constantValueEnabled
              }
            >
              <div style={imageFrameStyle}>
                <div style={imageWrapperStyle}>
                  {resolvedImageUrl ? (
                    <Image
                      image={resolvedImage as any}
                      className="boutique-about__image"
                      style={imageStyle}
                    />
                  ) : null}
                </div>
              </div>
            </EntityField>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const aboutFields: YextFields<BoutiqueShopAboutProps> = {
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
  cardBackgroundColor: {
    label: msg("fields.cardBackgroundColor", "Card Background Color"),
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  heading: {
    label: msg("fields.heading", "Heading"),
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
  body: {
    label: msg("fields.body", "Body"),
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
  aboutImage: {
    label: msg("fields.aboutImage", "About Image"),
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

export const BoutiqueShopAbout: YextComponentConfig<BoutiqueShopAboutProps> =
  {
    label: "About",
    fields: aboutFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-primary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "About This Store",
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
      cardBackgroundColor: defaultAboutCardBackgroundColor,
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "[[name]] is located in 1800 N Halsted St and serves Chicago's diverse neighborhoods. Our flagship offers an elevated shopping experience, combining high-tech convenience with personalized boutique service. The store features modern, spacious fitting rooms with adjustable lighting, a lounge area for companions, and seamless mobile checkout to save you time.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
      },
      aboutImage: {
        image: {
          field: "",
          constantValue: DEFAULT_ABOUT_IMAGE,
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
    },
    render: (props) => <AboutComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopAbout",
  displayName: "About",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
