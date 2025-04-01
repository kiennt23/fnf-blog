import { useEffect, useRef } from "react";

/**
 * This should only be used for development purposes.
 * Remove this when you are done debugging.
 *
 * @param name name of the component
 * @param props props of the component
 */
export const useWhyDidYouUpdate = (
  name: string,
  props: { [key: string]: unknown },
) => {
  const previousProps = useRef(props);

  useEffect(() => {
    const changes: { [key: string]: unknown } = {};
    Object.keys(props).forEach((key: string) => {
      if (props[key] !== previousProps.current[key]) {
        changes[key] = {
          from: previousProps.current[key],
          to: props[key],
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      console.log(`[${name}] props changed:`, changes);
    }

    previousProps.current = props;
  });
};
