import React from 'react';
import { ShieldCheck, Activity, SearchCheck, CheckCircle2 } from 'lucide-react';

export const CraftsmanshipSection: React.FC = () => {
  const steps = [
    {
      icon: SearchCheck,
      number: '01',
      title: 'Visual & Physical Inspection',
      description:
        'Detailed examination of dial, hands, glass, bezel, caseback, and serial numbers to confirm original condition.',
    },
    {
      icon: Activity,
      number: '02',
      title: 'Movement & Timing Test',
      description:
        'Accuracy, timing amplitude, and power reserve tested across standard operating positions for smooth performance.',
    },
    {
      icon: ShieldCheck,
      number: '03',
      title: 'Seal & Resistance Check',
      description:
        'Gaskets and seals checked to ensure proper dust and water resistance according to watch specifications.',
    },
    {
      icon: CheckCircle2,
      number: '04',
      title: 'Authenticity Verification',
      description:
        'Serial numbers and documentation cross-checked to guarantee 100% genuine origin.',
    },
  ];

  return (
    <section id="quality" className="py-16 sm:py-24 bg-white dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
            Quality Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 font-bold">
            Our 4-Step Quality Inspection
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
            No watch is listed or shipped without passing thorough authenticity and performance checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500 transition-all duration-300 space-y-4 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:border-amber-500 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-2xl text-slate-300 dark:text-slate-700 group-hover:text-amber-500/50 font-bold transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-serif text-base text-slate-900 dark:text-slate-100 font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
