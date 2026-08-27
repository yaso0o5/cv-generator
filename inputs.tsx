"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";

const control =
  "w-full rounded-[6px] border border-line bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-150 hover:border-ink-3/60 focus:border-accent focus:outline-none";

export function Field({
  label,
  hint,
  error,
  action,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
}

export function TextInput({ label, hint, error, action, className = "", ...rest }: TextInputProps) {
  const id = useId();
  const input = (
    <input
      id={id}
      {...rest}
      aria-invalid={error ? true : undefined}
      className={`${control} ${error ? "border-danger" : ""} ${className}`}
    />
  );
  if (!label) return input;
  return (
    <Field label={label} hint={hint} error={error} action={action} htmlFor={id}>
      {input}
    </Field>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  action?: ReactNode;
}

export function TextArea({ label, hint, error, action, className = "", ...rest }: TextAreaProps) {
  const id = useId();
  const area = (
    <textarea
      id={id}
      {...rest}
      aria-invalid={error ? true : undefined}
      className={`${control} min-h-24 resize-y leading-relaxed ${error ? "border-danger" : ""} ${className}`}
    />
  );
  if (!label) return area;
  return (
    <Field label={label} hint={hint} error={error} action={action} htmlFor={id}>
      {area}
    </Field>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export function Select({ label, hint, className = "", children, ...rest }: SelectProps) {
  const id = useId();
  const select = (
    <select id={id} {...rest} className={`${control} pr-8 ${className}`}>
      {children}
    </select>
  );
  if (!label) return select;
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      {select}
    </Field>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded-[3px] border-line accent-[var(--color-accent)]"
      />
      <label htmlFor={id} className="text-[13px] text-ink-2">
        {label}
      </label>
    </div>
  );
}
