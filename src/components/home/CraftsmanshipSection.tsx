import React from 'react';
import { ShieldCheck, Activity, SearchCheck, CheckCircle2 } from 'lucide-react';

export const CraftsmanshipSection: React.FC = () => {
  const steps = [
    {
      icon: SearchCheck,
      number: '01',
      title: 'Microscopic & Aesthetic Audit',
      description:
        'Detailed loupe examination of the dial, hour hands, bevels, bezel indices, caseback serials, and hallmark stamps to ensure 100% factory original condition.',
    },
    {
      icon: Activity,
      number: '02',
      title: 'Witschi Timing & Amplitude Test',
      description:
        'Calibre performance measured across 5 standard horological positions to guarantee COSC / Superlative chronometer precision and healthy power reserve.',
    },
    {
      icon: ShieldCheck,
      number: '03',
      title: 'Hydrostatic Pressure Testing',
      description:
        'Gasket health and hermetic sealing checked in modern dry and wet pressure testing chambers to verify rated aquatic resistance.',
    },
    {
      icon: CheckCircle2,
      number: '04',
      title: 'Provenance & Archive Validation',
      description:
        'Direct serial verification against manufacturer registry databases, insurance registers, and global theft watchlists.',
    },
  ];

  return (
    <section id="craftsmanship" className="py-20 sm:py-28 bg-luxury-900/40 border-t border-luxury-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] uppercase tracking-ultra text-gold font-semibold block">
            Atelier Quality Protocol
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-luxury-100 font-normal">
            The 32-Point Master Inspection
          </h2>
          <p className="text-xs sm:text-sm text-luxury-400 font-light">
            No timepiece enters our catalogue without passing uncompromised mechanical and provenance clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-xl bg-luxury-950/80 border border-luxury-800/80 hover:border-gold/50 transition-all duration-300 space-y-4 hover:shadow-luxury group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-luxury-900 border border-luxury-700 flex items-center justify-center text-gold group-hover:border-gold transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-2xl text-luxury-700 group-hover:text-gold/40 font-bold transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-serif text-base text-luxury-100 font-semibold group-hover:text-gold transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs text-luxury-400 leading-relaxed font-light">
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
