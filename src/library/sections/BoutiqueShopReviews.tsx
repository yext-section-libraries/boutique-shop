import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  getAggregateRating,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  EntityField,
  ReviewStars,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { PuckComponent } from "@puckeditor/core";

type ThemeSection = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type TextStyleProps = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type ReviewItem = {
  authorName?: string;
  comments?: unknown;
  content?: string;
  rating?: number;
  reviewDate?: string;
};

type ReviewAggregate = {
  publisher?: string;
  topReviews?: ReviewItem[];
};

type StoreDocument = {
  locale?: string;
  ref_reviewsAgg?: ReviewAggregate[];
};

type BoutiqueShopReviewsProps = {
  id?: string;
  section: ThemeSection;
  heading: StyledTextProps;
  summaryStarsColor?: ThemeColor;
  itemStarsColor?: ThemeColor;
  reviewerName?: TextStyleProps;
  ratingText?: TextStyleProps;
  reviewContent?: TextStyleProps;
};

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    authorName: "Placeholder Reviewer 1",
    content:
      "Sample placeholder review shown in Editor when no real reviews are available.",
    rating: 5,
  },
  {
    authorName: "Placeholder Reviewer 2",
    content:
     "Sample placeholder review shown in Editor when no real reviews are available.",
    rating: 4,
  },
  {
    authorName: "Placeholder Reviewer 3",
    content:
      "Sample placeholder review shown in Editor when no real reviews are available.",
    rating: 5,
  },
];

const defaultReviewerNameStyle: TextStyleProps = {
  styles: {
    fontFamily: "inherit",
    fontSize: "25px",
    fontWeight: "400",
    fontStyle: "normal",
    textTransform: "none",
  },
};

const defaultRatingTextStyle: TextStyleProps = {
  styles: {
    fontFamily: "inherit",
    fontSize: "16px",
    fontWeight: "400",
    fontStyle: "normal",
    textTransform: "none",
  },
};

const defaultReviewContentStyle: TextStyleProps = {
  styles: {
    fontFamily: "inherit",
    fontSize: "16px",
    fontWeight: "400",
    fontStyle: "normal",
    textTransform: "none",
  },
};

const REVIEW_STYLES = `
.boutique-reviews {
  padding: 90px 0;
  color: var(--palette-primary, #262b2c);
}

.boutique-reviews p {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-reviews li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-reviews h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}

.boutique-reviews h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}

.boutique-reviews h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}

.boutique-reviews h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}

.boutique-reviews h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}

.boutique-reviews h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}

.boutique-reviews a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: underline;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}

.boutique-reviews__shell {
  margin: 0 auto;
  max-width: 1540px;
  padding: 0 24px;
}

.boutique-reviews__heading {
  line-height: 1.2;
  margin: 0;
  text-align: center;
}

.boutique-reviews__summary {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: clamp(16px, 1.5vw, 20px) 0 clamp(40px, 4vw, 56px);
}

.boutique-reviews__summaryScore,
.boutique-reviews__summaryCount,
.boutique-reviews__rating {
  color: color-mix(in srgb, currentColor 68%, transparent);
  font-size: 16px;
  line-height: 1.5;
}

.boutique-reviews__summaryDivider {
  color: color-mix(in srgb, currentColor 30%, transparent);
  font-size: 18px;
  line-height: 1;
}

.boutique-reviews__stars {
  align-items: center;
  display: inline-flex;
  line-height: 1;
}

.boutique-reviews__summaryStars {
  font-size: 20px;
  letter-spacing: 0.12em;
}

.boutique-reviews__itemStars {
  font-size: 19px;
  letter-spacing: 0.08em;
}

.boutique-reviews__list {
  display: grid;
  gap: clamp(32px, 4vw, 48px);
  list-style: none;
  margin: 0 auto;
  max-width: 62rem;
  padding: 0;
}

.boutique-reviews__item {
  display: grid;
  gap: 16px;
}

.boutique-reviews__author {
  color: currentColor;
  font-size: 25px;
  letter-spacing: 0.02em;
  line-height: 1.05;
  margin: 0;
}

.boutique-reviews__copy {
  color: color-mix(in srgb, currentColor 76%, transparent);
  font-size: clamp(16.8px, 16px + 0.22vw, 18.4px);
  line-height: 1.72;
  margin: 0;
  max-width: 56rem;
}

.boutique-reviews__meta {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
}

@media (max-width: 1024px) {
  .boutique-reviews {
    padding: 64px 0;
  }

  .boutique-reviews__shell {
    padding: 0 18px;
  }
}

@media (max-width: 767px) {
  .boutique-reviews__summary {
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-bottom: 32px;
  }

  .boutique-reviews__meta {
    gap: 12px 14px;
  }

  .boutique-reviews__author {
    font-size: 21px;
  }
}
`;

function resolveExplicitColor(
  fontColor: string | ThemeColor | undefined,
): React.CSSProperties | undefined {
  const color = getThemeColorCssValue(fontColor);
  return color ? { color } : undefined;
}

function getContrastStarColor(sectionColor: ThemeColor): ThemeColor {
  const contrastColor =
    getThemeColorCssValue(sectionColor.contrastingColor) === "#ffffff" ||
    sectionColor.contrastingColor === "white"
      ? "white"
      : "black";

  return {
    selectedColor: contrastColor,
    contrastingColor: contrastColor === "white" ? "black" : "white",
  };
}

function resolveStarsColor(
  color: ThemeColor | undefined,
  sectionColor: ThemeColor,
): ThemeColor {
  if (
    color?.selectedColor &&
    color.selectedColor !== "default" &&
    getThemeColorCssValue(color)
  ) {
    return color;
  }

  return getContrastStarColor(sectionColor);
}

function textStyle(
  value: TextStyleProps | undefined,
  fallback: TextStyleProps,
): React.CSSProperties {
  const resolvedValue = {
    ...fallback,
    ...value,
    styles: {
      ...fallback.styles,
      ...value?.styles,
    },
  };

  return {
    ...resolveExplicitColor(resolvedValue.fontColor),
    fontFamily: resolvedValue.styles.fontFamily,
    fontSize: resolvedValue.styles.fontSize,
    fontStyle: resolvedValue.styles.fontStyle,
    fontWeight: resolvedValue.styles.fontWeight,
    textTransform: resolvedValue.styles.textTransform,
  };
}

const ReviewsComponent: PuckComponent<BoutiqueShopReviewsProps> = (
  props,
) => {
  const streamDocument = useDocument<StoreDocument>();
  const locale = streamDocument.locale ?? "en";

  const ratingSummary = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument?.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const hasFirstPartyReviews = reviews.length > 0;
  const visibleReviews = hasFirstPartyReviews ? reviews : SAMPLE_REVIEWS;
  const ratedReviews = visibleReviews.filter((review) => review.rating);
  const averageVisibleRating = ratedReviews.length
    ? ratedReviews.reduce((total, review) => total + (review.rating ?? 0), 0) /
      ratedReviews.length
    : 4.7;
  const summaryAverageRating =
    ratingSummary?.averageRating ?? averageVisibleRating;
  const summaryReviewCount = ratingSummary?.reviewCount ?? visibleReviews.length;
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const summaryStarsColor = resolveStarsColor(
    props.summaryStarsColor,
    props.section.backgroundColor,
  );
  const itemStarsColor = resolveStarsColor(
    props.itemStarsColor,
    props.section.backgroundColor,
  );

  if (!hasFirstPartyReviews && !props.puck.isEditing) {
    return <></>;
  }

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopReviews${getAnalyticsScopeHash(props.id ?? "reviews")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section
          className="boutique-reviews"
          style={getSurfaceColorStyle(props.section.backgroundColor, streamDocument)}
        >
          <style>{REVIEW_STYLES}</style>
          <div className="boutique-reviews__shell">
            <EntityField
              displayName="Heading"
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="boutique-reviews__heading"
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
            {hasFirstPartyReviews || props.puck.isEditing ? (
              <>
                <div
                  className="boutique-reviews__summary"
                  aria-label="Review summary"
                >
                  <span className="boutique-reviews__summaryScore">
                    {summaryAverageRating.toFixed(1)}
                  </span>
                  <span
                    className="boutique-reviews__stars boutique-reviews__summaryStars"
                    aria-hidden="true"
                  >
                    <ReviewStars
                      averageRating={summaryAverageRating}
                      reviewCount={summaryReviewCount}
                      color={summaryStarsColor}
                    />
                  </span>
                  <span
                    className="boutique-reviews__summaryDivider"
                    aria-hidden="true"
                  >
                    |
                  </span>
                  <span className="boutique-reviews__summaryCount">
                    {summaryReviewCount} Reviews
                  </span>
                </div>
                <ul className="boutique-reviews__list">
                  {visibleReviews.slice(0, 3).map((review, index) => (
                    <li
                      className="boutique-reviews__item"
                      key={`${review.authorName ?? review.reviewDate ?? "review"}-${index}`}
                    >
                      <div className="boutique-reviews__meta">
                        <h3
                          className="boutique-reviews__author"
                          style={textStyle(
                            props.reviewerName,
                            defaultReviewerNameStyle,
                          )}
                        >
                          {review.authorName ?? "Customer"}
                        </h3>
                        <span
                          className="boutique-reviews__stars boutique-reviews__itemStars"
                          aria-hidden="true"
                        >
                          <ReviewStars
                            averageRating={review.rating ?? 5}
                            color={itemStarsColor}
                          />
                        </span>
                        <span
                          className="boutique-reviews__rating"
                          style={textStyle(
                            props.ratingText,
                            defaultRatingTextStyle,
                          )}
                        >
                          {review.rating ?? 5}/5 stars
                        </span>
                      </div>
                      <p
                        className="boutique-reviews__copy"
                        style={textStyle(
                          props.reviewContent,
                          defaultReviewContentStyle,
                        )}
                      >
                        {review.content ?? ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const reviewsFields: YextFields<BoutiqueShopReviewsProps> = {
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
  summaryStarsColor: {
    label: "Summary Stars Color",
    type: "basicSelector",
    options: "SITE_COLOR",
  },
  itemStarsColor: {
    label: "Review Item Stars Color",
    type: "basicSelector",
    options: "SITE_COLOR",
  },
  reviewerName: {
    label: "Reviewer Name",
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
  ratingText: {
    label: "Rating Text",
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
  reviewContent: {
    label: "Review Content",
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

export const BoutiqueShopReviews: YextComponentConfig<BoutiqueShopReviewsProps> =
  {
    label: "Reviews",
    fields: reviewsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-quaternary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      heading: makeTextDefault("What Customers Are Saying", {
        fontSize: "25px",
        fontWeight: "500",
      }),
      reviewerName: defaultReviewerNameStyle,
      ratingText: defaultRatingTextStyle,
      reviewContent: defaultReviewContentStyle,
    },
    render: (props) => <ReviewsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
