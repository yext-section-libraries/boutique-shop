import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { FiPlus } from "react-icons/fi";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  msg,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";
import { renderRichText, resolveExplicitColor } from "../shared/sectionStyles";

type ThemeSection = {
  visibleOnLivePage: boolean;
  backgroundColor: ThemeColor;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type FaqQuestionStyles = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type FaqAnswerStyles = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type FaqStyles = {
  question: FaqQuestionStyles;
  answer: FaqAnswerStyles;
};

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqSource = createItemSource<FaqItemFields>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: { types: ["type.string"] },
    },
    answer: {
      type: "entityField",
      label: "Answer",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
  defaultValues: [
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Do I need an appointment for a stylist?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Walk-ins are always welcome, but we recommend booking an appointment for one-on-one styling support during evenings and weekends.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Where is the best place to park?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Validated parking is available at the neighboring garage on Halsted, and limited street parking is typically available in the mornings.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Can I return items I bought online at the store?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Yes. Bring your order confirmation and the unworn item to the store, and our team can process the return according to our service guidelines.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: {
          defaultValue: "Is tailoring available for clothes bought elsewhere?",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Our tailoring team can help with many garments purchased outside the store as long as they meet our service guidelines.",
          ),
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type BoutiqueShopFaqProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  faqs: {
    data: typeof faqSource.value;
    styles: FaqStyles;
  };
};

const FAQ_STYLES = `
.boutique-faq {
  padding: 72px 0;
}

.boutique-faq p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-faq li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-faq h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-faq h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-faq h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-faq h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-faq h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-faq h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-faq a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-faq__shell {
  margin: 0 auto;
  max-width: 1600px;
  padding: 0 24px;
}

.boutique-faq__heading {
  margin: 0 0 32px;
  text-align: center;
}

.boutique-faq__list {
  list-style: none;
  margin: 0 auto;
  max-width: 1040px;
  padding: 0;
}

.boutique-faq__item {
  border-bottom: 1px solid currentColor;
}

.boutique-faq__toggle {
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 18px 0;
  text-align: left;
  width: 100%;
}

.boutique-faq__icon {
  color: currentColor;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.boutique-faq__icon[data-open="true"] {
  transform: rotate(45deg);
}

.boutique-faq__answer {
  max-width: 832px;
  padding: 0 0 18px;
}

@media (max-width: 1024px) {
  .boutique-faq {
    padding: 64px 0;
  }

  .boutique-faq__shell {
    padding: 0 18px;
  }
}
`;


const FaqComponent: PuckComponent<BoutiqueShopFaqProps> = (props) => {
  const [openIndex, setOpenIndex] = React.useState(0);
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedFaqs = faqSource.resolveItems(props.faqs.data, streamDocument);

  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopFaq${getAnalyticsScopeHash(props.id ?? "faq")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="boutique-faq"
          style={getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          )}
        >
          <style>{FAQ_STYLES}</style>
          <div className="boutique-faq__shell">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="boutique-faq__heading"
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
              displayName="FAQ Items"
              fieldId={props.faqs.data.field}
              constantValueEnabled={props.faqs.data.constantValueEnabled}
            >
              <ul className="boutique-faq__list">
                {resolvedFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  const resolvedQuestion =
                    resolveComponentData(faq.question, locale, streamDocument, {
                      output: "plainText",
                    }) || "";
                  const answerStyleOverrides = {
                    ...props.faqs.styles.answer.styles,
                    color: props.faqs.styles.answer.fontColor,
                  };
                  const resolvedAnswer = faq.answer
                    ? resolveComponentData(faq.answer, locale, streamDocument)
                    : undefined;

                  return (
                    <li
                      key={`${resolvedQuestion}-${index}`}
                      className="boutique-faq__item"
                    >
                      <button
                        className="boutique-faq__toggle"
                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                        type="button"
                      >
                        <span
                          style={{
                            ...resolveExplicitColor(
                              props.faqs.styles.question.fontColor,
                            ),
                            fontFamily:
                              props.faqs.styles.question.styles.fontFamily,
                            fontSize:
                              props.faqs.styles.question.styles.fontSize,
                            fontStyle:
                              props.faqs.styles.question.styles.fontStyle,
                            fontWeight:
                              props.faqs.styles.question.styles.fontWeight,
                            textTransform:
                              props.faqs.styles.question.styles.textTransform,
                          }}
                        >
                          {resolvedQuestion}
                        </span>
                        <FiPlus
                          className="boutique-faq__icon"
                          data-open={isOpen ? "true" : "false"}
                          size={14}
                        />
                      </button>
                      {isOpen ? (
                        <div className="boutique-faq__answer">
                          <div
                            style={{
                              ...resolveExplicitColor(
                                props.faqs.styles.answer.fontColor,
                              ),
                              fontFamily:
                                props.faqs.styles.answer.styles.fontFamily,
                              fontSize:
                                props.faqs.styles.answer.styles.fontSize,
                              fontStyle:
                                props.faqs.styles.answer.styles.fontStyle,
                              fontWeight:
                                props.faqs.styles.answer.styles.fontWeight,
                              textTransform:
                                props.faqs.styles.answer.styles.textTransform,
                            }}
                          >
                            {renderRichText(
                              resolvedAnswer,
                              answerStyleOverrides,
                            )}
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </EntityField>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const faqFields: YextFields<BoutiqueShopFaqProps> = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
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
  faqs: {
    label: msg("fields.faqs", "FAQs"),
    type: "object",
    objectFields: {
      data: faqSource.field,
      styles: {
        label: msg("fields.faqStyles", "FAQ Styles"),
        type: "object",
        objectFields: {
          question: {
            label: msg("fields.question", "Question"),
            type: "object",
            objectFields: {
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
          answer: {
            label: msg("fields.answer", "Answer"),
            type: "object",
            objectFields: {
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
    fontSize: "18px",
    fontWeight: "600",
    fontStyle: "normal",
    textTransform: "none",
    ...styles,
  },
  fontColor,
});

export const BoutiqueShopFaq: YextComponentConfig<BoutiqueShopFaqProps> =
  {
    label: "FAQ",
    fields: faqFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-quaternary-light",
          contrastingColor: "black",
        },
      },
      heading: makeTextDefault("Frequently Asked Questions", {
        fontSize: "25px",
        fontWeight: "500",
      }),
      faqs: {
        data: faqSource.defaultValue,
        styles: {
          question: {
            styles: {
              fontFamily: "inherit",
              fontSize: "20px",
              fontWeight: "600",
              fontStyle: "normal",
              textTransform: "none",
            },
          },
          answer: {
            styles: {
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              fontStyle: "normal",
              textTransform: "none",
            },
          },
        },
      },
    },
    render: (props) => <FaqComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopFaq",
  displayName: "FAQ",
  description: "FAQ",
  pageSetTypes: ["ENTITY"],
};
