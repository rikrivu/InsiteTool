import { useState, useEffect, Dispatch, SetStateAction, RefObject, useCallback, MutableRefObject, createRef } from 'react';

export interface WindowSize {
  width: number;
  height: number;
  ref?: (element: HTMLDivElement) => void
}

function useContainerSize(): WindowSize {
  // Initialize state with undefined width/height so server and client renders match
//   const ref: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    let refObj: HTMLDivElement | null = null;
    const ref = (element: HTMLDivElement) => {
        refObj = element;
    }
    const [dimensions, setDimensions] = useState<WindowSize>({ width: 0, height: 0})

  useEffect(() => {
    if (refObj) {
      const { width, height } = refObj.getBoundingClientRect()
      setDimensions({ width: Math.round(width), height: Math.round(height) })
    }
  }, [refObj])
  return {...dimensions, ref}
}

export default useContainerSize;