import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-zinc-900",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:outline-zinc-400",
  ghost:
    "bg-transparent text-zinc-900 hover:bg-zinc-100 focus-visible:outline-zinc-400 dark:text-zinc-100 dark:hover:bg-zinc-900/40",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
  }
>;

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Chargement…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

