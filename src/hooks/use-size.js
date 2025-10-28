// It's a React hook that efficiently tracks element dimensions by debouncing ResizeObserver updates to prevent excessive re-renders.

import useResizeObserver from "@react-hook/resize-observer";  // For monitoring element size changes
import { useLayoutEffect, useState } from "react";
import '../ui/image.css';

export const useSize = (ref, threshold = 50) => {
  const [size, setSize] = useState(null);

  const updateSize = (newSize) => {
    if (!size) {
      setSize(newSize);
      return;
    }

    const widthDiff = Math.abs(newSize.width - size.width);
    const heightDiff = Math.abs(newSize.height - size.height);

    if (widthDiff > threshold || heightDiff > threshold) {
      setSize(newSize);
    }
  };

  useLayoutEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      updateSize({ width, height });
    }
  }, [ref.current, size]);

  useResizeObserver(ref, (entry) => {
    const { width, height } = entry.contentRect;
    if (size && (size.width !== width || size.height !== height)) {
      updateSize({ width, height });
    }
  });

  return size;
};