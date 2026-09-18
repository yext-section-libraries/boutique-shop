import {
  msg,
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
          typography: { label: msg("fields.typography", "Typography"), type: "styledText" },
          letterSpacing: {
            label: msg("fields.letterSpacing", "Letter Spacing"),
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
            label: msg("fields.variant", "Variant"),
            options: [
              { label: msg("fields.options.solid", "Solid"), value: "primary" },
              { label: msg("fields.options.outline", "Outline"), value: "secondary" },
              { label: msg("fields.options.link", "Link"), value: "link" },
            ],
          },
          presetImage: {
            type: "basicSelector",
            label: msg("fields.presetImage", "Preset Image"),
            options: "PRESET_IMAGE",
            visible: false,
          },
          color: {
            type: "basicSelector",
            label: msg("fields.color", "Color"),
            options: "SITE_COLOR",
            visible: true,
          },
          button: {
            type: "custom",
            label: msg("fields.buttonStyles", "Button Styles"),
            visible: showButtonStyles,
            render: renderButtonStylesFieldWithoutBorderRadius,
          },
          link: {
            type: "styledLink",
            label: msg("fields.linkStyles", "Link Styles"),
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
            label: msg("fields.data", "Data"),
            objectFields: {
              actionType: {
                type: "radio",
                label: msg("fields.actionType", "Action Type"),
                options: [
                  { label: msg("fields.options.link", "Link"), value: "link" },
                  { label: msg("fields.options.button", "Button"), value: "button" },
                ],
              },
              cta: {
                type: "ctaSelector",
                label: msg("fields.cta", "CTA"),
                visible: !isButton,
              },
              openInNewTab: {
                type: "radio",
                label: msg("fields.openInNewTab", "Open in New Tab"),
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
                visible: !isButton,
              },
              buttonText: {
                type: "translatableString",
                label: msg("fields.buttonText", "Button Text"),
                filter: { types: ["type.string"] },
                visible: isButton,
              },
              customId: { type: "text", label: msg("fields.customId", "Custom Id"), visible: isButton },
              customClass: {
                type: "text",
                label: msg("fields.customClass", "Custom Class"),
                visible: isButton,
              },
              dataAttributes: {
                type: "array",
                label: msg("fields.dataAttributes", "Data Attributes"),
                defaultItemProps: { key: "", value: "" },
                arrayFields: {
                  key: { type: "text", label: msg("fields.key", "Key") },
                  value: { type: "text", label: msg("fields.value", "Value") },
                },
                getItemSummary: (item: { key?: string }, index?: number) =>
                  item?.key?.trim()
                    ? item.key
                    : `Attribute ${(index ?? 0) + 1}`,
                visible: isButton,
              },
              ariaLabel: {
                type: "translatableString",
                label: msg("fields.ariaLabel", "Aria Label"),
                filter: { types: ["type.string"] },
                visible: isButton,
              },
            },
          },
          styles: {
            type: "object",
            label: msg("fields.styles", "Styles"),
            objectFields: {
              variant: {
                type: "radio",
                label: msg("fields.variant", "Variant"),
                options: [
                  { label: msg("fields.options.solid", "Solid"), value: "primary" },
                  { label: msg("fields.options.outline", "Outline"), value: "secondary" },
                  { label: msg("fields.options.link", "Link"), value: "link" },
                ],
                visible: !isPresetImage,
              },
              presetImage: {
                type: "basicSelector",
                label: msg("fields.presetImage", "Preset Image"),
                options: "PRESET_IMAGE",
                visible: isPresetImage,
              },
              color: {
                type: "basicSelector",
                label: msg("fields.color", "Color"),
                options: "SITE_COLOR",
                visible: !isPresetImage,
              },
              button: {
                type: "custom",
                label: msg("fields.buttonStyles", "Button Styles"),
                visible: showButtonStyles,
                render: renderButtonStylesFieldWithoutBorderRadius,
              },
              link: {
                type: "styledLink",
                label: msg("fields.linkStyles", "Link Styles"),
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
