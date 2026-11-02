"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/locales";

type ModelSelectProps = {
  models: string[];
  value: string | null;
  onValueChange: (model: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Shown only when there's a choice to make. */
export function ModelSelect({
  models,
  value,
  onValueChange,
  disabled,
  className,
}: ModelSelectProps) {
  if (models.length < 2 || value === null) return null;
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger aria-label={t.model.label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectGroup>
          {models.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
