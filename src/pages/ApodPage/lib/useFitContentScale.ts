import { useLayoutEffect, useRef } from 'react';

const DESKTOP_BREAKPOINT = 860;
const MIN_SCALE = 0.78;
const MAX_SCALE = 1.55;
const FIT_ITERATIONS = 10;

export function useFitContentScale(contentKey?: string) {
  const contentRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    let animationFrame = 0;
    let isDisposed = false;

    const fitContent = () => {
      if (isDisposed) {
        return;
      }

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (window.innerWidth <= DESKTOP_BREAKPOINT) {
          content.style.fontSize = '';
          return;
        }

        let minScale = MIN_SCALE;
        let maxScale = MAX_SCALE;

        for (let iteration = 0; iteration < FIT_ITERATIONS; iteration += 1) {
          const scale = (minScale + maxScale) / 2;
          content.style.fontSize = `${scale}rem`;

          if (content.scrollHeight <= content.clientHeight) {
            minScale = scale;
          } else {
            maxScale = scale;
          }
        }

        content.style.fontSize = `${minScale}rem`;
      });
    };

    const resizeObserver = new ResizeObserver(fitContent);
    resizeObserver.observe(content);
    window.addEventListener('resize', fitContent);
    void document.fonts.ready.then(fitContent);
    fitContent();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', fitContent);
    };
  }, [contentKey]);

  return contentRef;
}
