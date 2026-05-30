import { useEffect, useState, type ReactNode } from "react";

export function StepShell({
  stepKey,
  direction,
  children,
}: {
  stepKey: number;
  direction: 1 | -1;
  children: ReactNode;
}) {
  const [render, setRender] = useState({ key: stepKey, children, direction });

  useEffect(() => {
    setRender({ key: stepKey, children, direction });
  }, [stepKey, children, direction]);

  const enter =
    render.direction === 1
      ? "animate-step-in-right"
      : "animate-step-in-left";

  return (
    <div key={render.key} className={`${enter} will-change-transform`}>
      {render.children}
    </div>
  );
}
