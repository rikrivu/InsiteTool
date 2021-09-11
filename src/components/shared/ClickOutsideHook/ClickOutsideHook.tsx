import { useRef, useEffect, RefObject } from 'react';

// Hook
export function useOnClickOutside(handler: Function): RefObject<HTMLDivElement> {
  const dropDownRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  useEffect(
    () => {

      const handleClickOutside = (event: any) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!dropDownRef.current || dropDownRef.current.contains(event.target)) {
          return;
        }
        handler(event);
      }
  
      const handleHideDropdown = (event: any) => {
        if (event.key !== 'Escape') {
          return;
        }
        handler(event);
      }

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleHideDropdown);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        document.removeEventListener("keydown", handleHideDropdown);
      };
    },
    // Add dropDownRef and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [dropDownRef, handler]
  );

  return dropDownRef;
  }