import type { PropsWithChildren } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function IconWrap({
  children,
  title,
}: PropsWithChildren<{ title: string }>) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cx(
          "grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white shadow-sm",
          "dark:border-zinc-800 dark:bg-zinc-950",
        )}
        aria-hidden="true"
        title={title}
      >
        {children}
      </span>
      <span className="hidden sm:inline">{title}</span>
    </span>
  );
}

export function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-900 dark:text-zinc-100"
    >
      <path
        d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v3H7v3h3v8h3v-8h3l1-3h-4v-3c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-900 dark:text-zinc-100"
    >
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Z"
        fill="currentColor"
      />
      <path
        d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        fill="currentColor"
      />
      <path
        d="M17.5 6.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TikTokIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-900 dark:text-zinc-100"
    >
      <path
        d="M14 3v10.1a3.9 3.9 0 1 1-3-3.8V6.2a7 7 0 1 0 5 6.7V9.2c1.1 1.1 2.6 1.8 4 1.8V7.9c-2.2 0-4-1.8-4-4.9h-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SocialLink({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: "facebook" | "instagram" | "tiktok";
}) {
  const Icon =
    icon === "facebook"
      ? FacebookIcon
      : icon === "instagram"
        ? InstagramIcon
        : TikTokIcon;

  return (
    <a
      className={cx(
        "rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100",
        "dark:text-zinc-300 dark:hover:bg-zinc-900/40",
      )}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={title}
      title={title}
    >
      <IconWrap title={title}>
        <Icon />
      </IconWrap>
    </a>
  );
}

