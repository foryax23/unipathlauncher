import type { ComponentType } from "react";
import { PhotoChoiceCard } from "./PhotoChoiceCard";

export function GlassSubjectCard({
  title,
  image,
  active,
  onClick,
}: {
  id?: string;
  title: string;
  Icon?: ComponentType<{ className?: string }>;
  image?: string;
  active: boolean;
  onClick: () => void;
}) {
  return <PhotoChoiceCard title={title} image={image} active={active} onClick={onClick} />;
}
