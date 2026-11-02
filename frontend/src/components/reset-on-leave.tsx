"use client";

import { Fragment, useLayoutEffect, useState, type ReactNode } from "react";

// Next.js keeps visited pages alive but hidden (<Activity>), so their state
// would survive leaving. Remounting on hide makes every visit start fresh.
export function ResetOnLeave({ children }: { children: ReactNode }) {
  const [visit, setVisit] = useState(0);
  useLayoutEffect(() => () => setVisit((count) => count + 1), []);
  return <Fragment key={visit}>{children}</Fragment>;
}
