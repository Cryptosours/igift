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
      whileHover: _wh, // eslint-disable-line @typescript-eslint/no-unused-vars
      whileTap: _wt, // eslint-disable-line @typescript-eslint/no-unused-vars
      whileInView: _wv, // eslint-disable-line @typescript-eslint/no-unused-vars
      initial: _i, // eslint-disable-line @typescript-eslint/no-unused-vars
      animate: _a, // eslint-disable-line @typescript-eslint/no-unused-vars
      exit: _e, // eslint-disable-line @typescript-eslint/no-unused-vars
      transition: _tr, // eslint-disable-line @typescript-eslint/no-unused-vars
      layoutId: _li, // eslint-disable-line @typescript-eslint/no-unused-vars
      variants: _v, // eslint-disable-line @typescript-eslint/no-unused-vars
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
