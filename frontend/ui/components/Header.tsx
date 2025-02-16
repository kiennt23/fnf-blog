import React, { FC } from "react";

const Header: FC<{ className?: string }> = (props) => {
  return <h1 {...props}>Frames and Functions</h1>;
};

export default Header;
