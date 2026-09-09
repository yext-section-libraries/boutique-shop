import {
  type ComprehensiveCTAValue,
  YextAutoField,
  type YextCustomFieldRenderProps,
} from "@yext/visual-editor";

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

export function isPresetImageCta(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const ctaValue = value as {
    data?: {
      cta?: {
        selectedType?: string;
        constantValue?: { ctaType?: string };
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
          typography: { label: "Typography", type: "styledText" },
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

export function renderCtaStylesFieldWithoutBorderRadius({
  field,
  value,
  onChange,
}: YextCustomFieldRenderProps<ComprehensiveCTAValue["styles"]>) {
  const resolvedValue = {
    ...DEFAULT_COMPREHENSIVE_CTA.styles,
    ...value,
    button: { ...DEFAULT_CTA_BUTTON_STYLES, ...value?.button },
    link: { ...DEFAULT_CTA_LINK_STYLES, ...value?.link },
  } satisfies ComprehensiveCTAValue["styles"];
  const showButtonStyles = resolvedValue.variant !== "link";
  const showLinkStyles = resolvedValue.variant === "link";

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
          presetImage: {
            type: "basicSelector",
            label: "Preset Image",
            options: "PRESET_IMAGE",
            visible: false,
          },
          color: {
            type: "basicSelector",
            label: "Color",
            options: "SITE_COLOR",
            visible: true,
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
      }}
      value={resolvedValue}
      onChange={onChange}
    />
  );
}

export function renderComprehensiveCtaFieldWithoutBorderRadius({
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
      button: { ...DEFAULT_CTA_BUTTON_STYLES, ...value?.styles?.button },
      link: { ...DEFAULT_CTA_LINK_STYLES, ...value?.styles?.link },
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
              customId: { type: "text", label: "Custom Id", visible: isButton },
              customClass: {
                type: "text",
                label: "Custom Class",
                visible: isButton,
              },
              dataAttributes: {
                type: "array",
                label: "Data Attributes",
                defaultItemProps: { key: "", value: "" },
                arrayFields: {
                  key: { type: "text", label: "Key" },
                  value: { type: "text", label: "Value" },
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
                visible: !isPresetImage,
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
