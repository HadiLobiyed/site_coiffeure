import type { PropsWithChildren } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-zinc-200/70 bg-white shadow-sm",
        "dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cx("border-b border-zinc-200/70 p-6 dark:border-zinc-800", className)}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cx("p-6", className)}>{children}</div>;
}

