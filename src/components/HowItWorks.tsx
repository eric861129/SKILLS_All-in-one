import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, MousePointerClick, Zap, ChevronRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Connect',
    description: 'Link your favorite AI Agent (Claude, ChatGPT, etc.) to the platform.',
    icon: <Link2 size={24} />,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    id: 2,
    title: 'Select',
    description: 'Browse our high-quality skill library and select the ones you need.',
    icon: <MousePointerClick size={24} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    id: 3,
    title: 'Inject',
    description: 'One-click injection of chosen skills into your agent seamlessly.',
    icon: <Zap size={24} />,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="w-full py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black tracking-tighter text-white mb-4">
            How it Works
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Get your AI Agent powered up in three simple steps.
          </p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-3 gap-8 relative">
          {/* Progress Line */}
          <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-800 -z-10">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`
                w-24 h-24 rounded-3xl flex items-center justify-center mb-6 
                border-2 ${step.border} ${step.bg} ${step.color}
                shadow-lg shadow-black/20
              `}>
                {step.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${step.color}`}>{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile View (Simplified) */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-4 p-6 rounded-2xl border ${step.border} bg-slate-900/50`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${step.bg} ${step.color}`}>
                {step.icon}
              </div>
              <div>
                <h3 className={`font-bold mb-1 ${step.color}`}>{step.title}</h3>
                <p className="text-slate-400 text-xs">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
