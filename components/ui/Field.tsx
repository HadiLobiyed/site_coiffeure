import type { InputHTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Label({ children }: PropsWithChildren) {
  return <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{children}</label>;
}

export function HelperText({ children }: PropsWithChildren) {
  return <p className="text-sm text-zinc-500 dark:text-zinc-400">{children}</p>;
}

export function ErrorText({ children }: PropsWithChildren) {
  return <p className="text-sm text-red-600">{children}</p>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none",
        "placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-200 dark:focus:ring-zinc-200/10",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "min-h-[96px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none",
        "placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-200 dark:focus:ring-zinc-200/10",
        props.className,
      )}
    />
  );
}

