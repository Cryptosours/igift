import React from "react";

/**
 * Shared mock for motion/react — renders plain HTML elements.
 * Strips motion-specific props (whileHover, whileTap, initial, animate, exit, transition, layoutId).
 */
function createMotionComponent(tag: string) {
  return React.forwardRef(function MotionMock(
    props: Record<string, unknown>,
    ref: React.Ref<HTMLElement>,
  ) {
    // Strip motion-specific props
    const {
      whileHover: _wh,
      whileTap: _wt,
      whileInView: _wv,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _tr,
      layoutId: _li,
      variants: _v,
      ...htmlProps
    } = props;
    return React.createElement(tag, { ...htmlProps, ref });
  });
}

export const motionMock = {
  motion: {
    div: createMotionComponent("div"),
    a: createMotionComponent("a"),
    button: createMotionComponent("button"),
    span: createMotionComponent("span"),
    nav: createMotionComponent("nav"),
    section: createMotionComponent("section"),
    p: createMotionComponent("p"),
    li: createMotionComponent("li"),
    ul: createMotionComponent("ul"),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useReducedMotion: () => false,
  MotionConfig: ({ children }: React.PropsWithChildren) => <>{children}</>,
};
