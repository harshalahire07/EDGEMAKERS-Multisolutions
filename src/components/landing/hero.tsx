import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MotionDiv } from "./motion-div";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

const glitchVariants = {
  glitch: {
    x: [0, -2, 2, -2, 2, 0],
    y: [0, 1, -1, 1, -1, 0],
    skewX: [0, -5, 5, -5, 5, 0],
    opacity: [1, 0.8, 1, 0.8, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.05, 0.1, 0.15, 0.2, 0.25],
      repeat: 2,
      repeatDelay: 2,
    },
  },
};

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20 md:py-28 lg:py-40 xl:py-52 2xl:py-60 bg-gradient-to-br from-[hsl(var(--secondary))]/40 via-[hsl(var(--muted))]/60 to-[hsl(var(--card))]/30">
      <div className="absolute inset-0 bg-grid-green-200/[0.2] bg-[10px_10px] [mask-image:linear-gradient(0deg,transparent,hsl(var(--background)),transparent)]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      <div className="container relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
        <MotionDiv
          className="flex flex-col items-center space-y-6 sm:space-y-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MotionDiv className="space-y-3 sm:space-y-4" variants={itemVariants}>
            <MotionDiv variants={glitchVariants} animate="glitch">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold tracking-tighter bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent px-4">
                  EDGEMAKERS
                </h2>
                <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tighter text-foreground px-4">
                  Pioneering Innovative Solutions
                </h1>
              </div>
            </MotionDiv>
            <p className="mx-auto max-w-[90%] sm:max-w-[600px] md:max-w-[700px] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground px-4">
              At EDGEMAKERS Solutions, we empower businesses to thrive by
              integrating cutting-edge, high-performance practices. Let's build
              a smarter future, together.
            </p>
          </MotionDiv>
          <MotionDiv
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <Button asChild size="lg" className="shadow-glow w-full sm:w-auto">
              <Link href="#contact">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-accent/50 text-accent hover:bg-accent/10 hover:text-accent-foreground shadow-glow w-full sm:w-auto"
            >
              <Link href="#services">Learn More</Link>
            </Button>
          </MotionDiv>
        </MotionDiv>
      </div>
    </section>
  );
}
