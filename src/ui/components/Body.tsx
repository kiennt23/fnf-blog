import React, { ReactNode } from "react";

const Body: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  ...props
}) => <div {...props}>{children}</div>;

export default Body;
