import React, { FC } from "react";
import { Item, List, Root } from "@radix-ui/react-navigation-menu";
import { Link } from "react-router-dom";

const Sidebar: FC<{
  isAuthenticated?: boolean;
  user?: { name?: string };
  className?: string;
}> = ({ isAuthenticated, user, ...props }) => {
  return (
    <Root orientation="vertical" {...props}>
      <List>
        <Item>
          <Link to="/">Home</Link>
        </Item>
        <Item>
          <Link to="/frames">Frames</Link>
        </Item>
        <Item>
          <Link to="/functions">Functions</Link>
        </Item>
        <Item>
          <Link to="/about">About</Link>
        </Item>
        {isAuthenticated && (
          <Item>
            Welcome {user?.name}! <a href="/logout">Log out</a>
          </Item>
        )}
      </List>
    </Root>
  );
};

export default Sidebar;
