'use client';

import Hero from '@/components/Hero';
import ProjectGrid from '@/components/ProjectGrid';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Home() {
  return (
    <motion.main
      className="space-y-16"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <Hero />
      <ProjectGrid />
      <Footer />
    </motion.main>
  );
}
