"use client";

import { Fragment, useLayoutEffect, useState, type ReactNode } from "react";

// Next.js keeps recently visited pages alive but hidden (Cache Components
// uses React's <Activity>), so their state survives leaving and coming back.
// This remounts its children as soon as the page is hidden, so every visit,
// including one through the back button, starts fresh. See Next.js's
// "Preserving UI state" guide.
export function ResetOnLeave({ children }: { children: ReactNode }) {
  const [visit, setVisit] = useState(0);
  // Layout effect cleanups run synchronously when the page is hidden.
  useLayoutEffect(() => () => setVisit((count) => count + 1), []);
  return <Fragment key={visit}>{children}</Fragment>;
}
