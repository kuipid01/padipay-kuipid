"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5 mb-6", className)}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-1.5"
      >
        <h1 className="text-3xl md:text-4xl font-black text-main-green tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-xl">
            {description}
          </p>
        )}
      </motion.div>

      {actions && (
        <motion.div
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
           className="flex items-center gap-3 shrink-0"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
