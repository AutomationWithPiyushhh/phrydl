export const glassClasses = {
  base: "bg-white/70 backdrop-blur-md border border-gray-200/50",
  card: "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm",
  panel: "bg-white/90 backdrop-blur-2xl border border-gray-200 shadow-md",
  nav: "bg-white/80 backdrop-blur-lg border-b border-gray-200",
};

export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } // Apple-like spring
  }
};
