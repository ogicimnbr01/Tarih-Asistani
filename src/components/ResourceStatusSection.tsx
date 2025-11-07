import React from 'react';
import { unitResourceStatus, resourceStatusMessage, UnitResource } from '../../constants'; 

const ResourceStatusSection: React.FC = () => {
  return (
    <section id="kaynak-durumu" className="py-16 md:py-24 bg-brand-dark">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-brand-light-dark rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white text-center mb-8">
            Kaynak Durumu
          </h2>
          <p className="text-brand-text-light text-center mb-10 text-lg mx-auto max-w-2xl">
            {resourceStatusMessage}
          </p>

          <div className="space-y-4">
            {unitResourceStatus.map((unit: UnitResource) => ( 
              <div
                key={unit.id}
                className="flex justify-between items-center bg-brand-dark p-4 rounded-lg border border-slate-700"
              >
                <span className="text-brand-text font-semibold text-lg md:text-xl">
                  {unit.name}
                </span>
                <span className={`font-bold text-xl md:text-2xl ${unit.docCount > 0 ? 'text-brand-accent' : 'text-slate-500'}`}>
                  {unit.docCount} belge
                </span>
              </div>
            ))}
          </div>

          <p className="mt-12 text-brand-text-light text-center text-sm">
            Bu bilgiler otomatik olarak güncellenmektedir.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResourceStatusSection;