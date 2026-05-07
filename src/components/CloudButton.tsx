import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import * as React from "react";

type Variant = "mint" | "outline";

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & (
  | { to: string; href?: never; onClick?: never; type?: never }
  | { href: string; to?: never; onClick?: never; type?: never }
  | { onClick?: () => void; to?: never; href?: never; type?: "button" | "submit" }
);

export function CloudButton({ variant = "mint", className, children, ...rest }: Props) {
  const cls = cn("cloud-btn", className);
  const dataVariant = variant;

  if ("to" in rest && rest.to) {
    return (
      <Link to={rest.to} className={cls} data-variant={dataVariant}>
        <span>{children}</span>
      </Link>
    );
  }
  if ("href" in rest && rest.href) {
    return (
      <a href={rest.href} className={cls} data-variant={dataVariant}>
        <span>{children}</span>
      </a>
    );
  }
  return (
    <button type={(rest as { type?: "button" | "submit" }).type ?? "button"} onClick={(rest as { onClick?: () => void }).onClick} className={cls} data-variant={dataVariant}>
      <span>{children}</span>
    </button>
  );
}
