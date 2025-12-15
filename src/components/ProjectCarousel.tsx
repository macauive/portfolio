'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import CarouselCard from './CarouselCard';

interface ProjectCarouselProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds
const DESKTOP_BREAKPOINT = 768; // matches md:
const CARDS_PER_VIEW_MOBILE = 1;
const CARDS_PER_VIEW_DESKTOP = 3;

export default function ProjectCarousel({ projects, onProjectClick }: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(CARDS_PER_VIEW_MOBILE);
  const [cardSize, setCardSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive breakpoint listener and card size calculator
  useEffect(() => {
    const handleResize = () => {
      const newCardsPerView = window.innerWidth >= DESKTOP_BREAKPOINT ? CARDS_PER_VIEW_DESKTOP : CARDS_PER_VIEW_MOBILE;
      setCardsPerView(newCardsPerView);

      // Calculate exact card size
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const gap = window.innerWidth >= DESKTOP_BREAKPOINT ? 24 : 16; // gap-6 (24px) or gap-4 (16px)
        const totalGaps = (newCardsPerView - 1) * gap;
        const availableWidth = containerWidth - totalGaps;
        const size = availableWidth / newCardsPerView;
        setCardSize(size);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isInteracting && projects.length > cardsPerView) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = projects.length - cardsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, AUTO_PLAY_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [isInteracting, projects.length, cardsPerView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cardsPerView, projects.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = projects.length - cardsPerView;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = projects.length - cardsPerView;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleDragEnd = (_event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine direction based on drag
    if (offset < -50 || velocity < -500) {
      nextSlide();
    } else if (offset > 50 || velocity > 500) {
      prevSlide();
    }

    setIsInteracting(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const totalSlides = Math.max(1, projects.length - cardsPerView + 1);

  // Calculate the offset in pixels
  const calculateOffset = () => {
    const gap = cardsPerView === 1 ? 16 : 24; // gap-4 (mobile) or gap-6 (desktop)
    return currentIndex * (cardSize + gap);
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Carousel container */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
      >
        <motion.div
          className="flex gap-4 md:gap-6"
          drag="x"
          dragElastic={0.1}
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setIsInteracting(true)}
          onDragEnd={handleDragEnd}
          animate={{
            x: `-${calculateOffset()}px`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          style={{ cursor: 'grab' }}
        >
          {projects.map((project, index) => {
            const isDesktop = cardsPerView > 1;
            return (
              <div
                key={project.id}
                className="flex-shrink-0"
                style={{
                  width: cardSize > 0 ? `${cardSize}px` : 'auto',
                  height: isDesktop && cardSize > 0 ? `${cardSize * 1.2}px` : 'auto',
                }}
              >
                <motion.div
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {isDesktop ? (
                    <CarouselCard
                      project={project}
                      onClick={() => onProjectClick(project)}
                    />
                  ) : (
                    <ProjectCard
                      project={project}
                      onClick={() => onProjectClick(project)}
                      index={index}
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Pagination dots */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-zinc-900 dark:bg-zinc-50 w-6'
                  : 'bg-zinc-300 dark:bg-zinc-700 w-2 hover:bg-zinc-400 dark:hover:bg-zinc-600'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
