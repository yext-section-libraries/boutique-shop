import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
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

type BreadcrumbEntry = {
  index?: number;
  name?: string;
  slug?: string;
};

type BoutiqueShopBreadcrumbsProps = {
  id?: string;
  section: ThemeSection;
  rootLabel: StyledTextProps;
  includeCurrentLocation: boolean;
};

const BREADCRUMBS_STYLES = `
.boutique-breadcrumbs {
  padding: 20px 0;
}

.boutique-breadcrumbs p,
.boutique-breadcrumbs li,
.boutique-breadcrumbs a,
.boutique-breadcrumbs span {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}

.boutique-breadcrumbs__shell {
  margin: 0 auto;
  max-width: 1540px;
  padding: 0 24px;
}

.boutique-breadcrumbs__list {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.boutique-breadcrumbs__item {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  max-width: 100%;
}

.boutique-breadcrumbs__label {
  display: inline-block;
  letter-spacing: 0.12em;
  max-width: 100%;
  text-decoration: none;
}

.boutique-breadcrumbs__link {
  text-decoration: none;
}

.boutique-breadcrumbs__link:hover,
.boutique-breadcrumbs__link:focus-visible {
  text-decoration: underline;
}

.boutique-breadcrumbs__separator {
  color: color-mix(in srgb, currentColor 45%, transparent);
  font-size: 0.9em;
}

.boutique-breadcrumbs__current {
  color: color-mix(in srgb, currentColor 78%, transparent);
}

@media (max-width: 1024px) {
  .boutique-breadcrumbs {
    padding: 16px 0;
  }

  .boutique-breadcrumbs__shell {
    padding: 0 18px;
  }
}
`;

const defaultRootLabelColor: ThemeColor = {
  selectedColor: "palette-quaternary",
  contrastingColor: "palette-quaternary-contrast",
};

const textStyles = (
  styles: StyledTextValue,
  fontColor?: string | ThemeColor,
): React.CSSProperties => ({
  color: getThemeColorCssValue(fontColor),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const BreadcrumbsComponent: PuckComponent<BoutiqueShopBreadcrumbsProps> = (
  props,
) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps();
  const breadcrumbs = (resolveBreadcrumbs(streamDocument) ??
    []) as BreadcrumbEntry[];
  const rootLabel =
    resolveComponentData(props.rootLabel.text, locale, streamDocument) || "";
  const currentPageLabel = streamDocument.name || "";

  if (!breadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  let visibleBreadcrumbs = props.includeCurrentLocation
    ? breadcrumbs
    : breadcrumbs.slice(0, -1);
  if (!visibleBreadcrumbs.length && breadcrumbs.length > 0) {
    visibleBreadcrumbs = breadcrumbs.slice(0, 1);
  }

  return (
    <AnalyticsScopeProvider
      name={`BoutiqueShopBreadcrumbs${getAnalyticsScopeHash(props.id ?? "breadcrumbs")}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section
          className="boutique-breadcrumbs"
          style={getSurfaceColorStyle(
            props.section.backgroundColor,
            streamDocument,
          )}
        >
          <style>{BREADCRUMBS_STYLES}</style>
          <div className="boutique-breadcrumbs__shell">
            <ol aria-label="Breadcrumb" className="boutique-breadcrumbs__list">
              {visibleBreadcrumbs.map((breadcrumb, position) => {
                const originalIndex = breadcrumb.index ?? position;
                const isRoot = originalIndex === 0;
                const isCurrent =
                  props.includeCurrentLocation &&
                  originalIndex === breadcrumbs.length - 1;
                const href = relativePrefixToRoot
                  ? `${relativePrefixToRoot}${breadcrumb.slug ?? ""}`
                  : (breadcrumb.slug ?? "");
                const label = isRoot
                  ? rootLabel || breadcrumb.name || ""
                  : isCurrent
                    ? currentPageLabel || breadcrumb.name || ""
                    : (breadcrumb.name ?? "");

                return (
                  <li
                    className="boutique-breadcrumbs__item"
                    key={`${breadcrumb.slug ?? label}-${originalIndex}`}
                  >
                    {position > 0 ? (
                      <span
                        aria-hidden="true"
                        className="boutique-breadcrumbs__separator"
                      >
                        /
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <EntityField
                        displayName="Current Page"
                        fieldId="name"
                        constantValueEnabled={false}
                      >
                        <span
                          aria-current="page"
                          className="boutique-breadcrumbs__label boutique-breadcrumbs__current"
                          style={textStyles(
                            props.rootLabel.styles,
                            props.rootLabel.fontColor,
                          )}
                        >
                          {label}
                        </span>
                      </EntityField>
                    ) : isRoot ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={props.rootLabel.text.field}
                        constantValueEnabled={
                          props.rootLabel.text.constantValueEnabled
                        }
                      >
                        <Link
                          className="boutique-breadcrumbs__label boutique-breadcrumbs__link"
                          eventName={`breadcrumb${originalIndex}`}
                          href={href}
                          style={textStyles(
                            props.rootLabel.styles,
                            props.rootLabel.fontColor,
                          )}
                        >
                          {label}
                        </Link>
                      </EntityField>
                    ) : (
                      <Link
                        className="boutique-breadcrumbs__label boutique-breadcrumbs__link"
                        eventName={`breadcrumb${originalIndex}`}
                        href={href}
                        style={textStyles(
                          props.rootLabel.styles,
                          props.rootLabel.fontColor,
                        )}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

const breadcrumbsFields: YextFields<BoutiqueShopBreadcrumbsProps> = {
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
  rootLabel: {
    label: "Root Label",
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
  includeCurrentLocation: {
    label: "Include Current Location",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
};

export const BoutiqueShopBreadcrumbs: YextComponentConfig<BoutiqueShopBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: breadcrumbsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-primary-light",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      rootLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "All Locations",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "inherit",
          fontSize: "12px",
          fontWeight: "600",
          fontStyle: "normal",
          textTransform: "uppercase",
        },
        fontColor: defaultRootLabelColor,
      },
      includeCurrentLocation: true,
    },
    render: (props) => <BreadcrumbsComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "BoutiqueShopBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
