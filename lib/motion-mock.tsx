import React from 'react';

// This is a simple mock for framer-motion to avoid installing it as a dependency
// In a real app, you would install framer-motion and use it properly

interface MotionProps {
  className?: string;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  transition?: Record<string, any>;
  children?: React.ReactNode;
}

// A mock implementation of motion.div
function MotionDiv({
  className,
  children,
  ...props
}: MotionProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export const motion = {
  div: MotionDiv,
};