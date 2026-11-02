"use client";

import { useId } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  isTextSize,
  TEXT_SIZES,
  type TextSize,
} from "@/features/text-size/text-size";
import { textSize } from "@/features/text-size/use-text-size";
import { t } from "@/locales";

const SIZES = Object.keys(TEXT_SIZES) as TextSize[];

// shadcn's choice cards (see the Field docs), one per size. Each shows a
// sample character scaled like that size, and a choice applies at once.
export function TextSizePicker() {
  const current = textSize.use();
  const id = useId();

  return (
    <FieldSet>
      <FieldLegend variant="label">{t.settings.textSize}</FieldLegend>
      <FieldDescription>{t.settings.textSizeDescription}</FieldDescription>
      <RadioGroup
        value={current}
        onValueChange={(value) => {
          if (isTextSize(value)) textSize.set(value);
        }}
        className="grid-cols-3"
      >
        {SIZES.map((size) => (
          <FieldLabel key={size} htmlFor={`${id}-${size}`}>
            <Field orientation="horizontal">
              <FieldContent>
                <span
                  aria-hidden
                  className="flex h-8 items-end leading-none"
                  style={{ fontSize: `${TEXT_SIZES[size] * 1.5}em` }}
                >
                  {t.settings.textSizeSample}
                </span>
                <FieldTitle>{t.settings.textSizes[size]}</FieldTitle>
              </FieldContent>
              <RadioGroupItem value={size} id={`${id}-${size}`} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
