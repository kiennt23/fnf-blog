import React, { FC, ReactNode } from "react";

export const Title: FC<{ children: ReactNode; className?: string }> = ({
  children,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => <h2 {...props}>{children}</h2>;

export const Content: FC<{ children: ReactNode; className?: string }> = ({
  children,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => <div {...props}>{children}</div>;
