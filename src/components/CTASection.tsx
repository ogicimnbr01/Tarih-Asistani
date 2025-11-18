import React from 'react';
import { BrainCircuitIcon, CloudIcon, AtomIcon } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section id="teknoloji" className="min-h-screen flex flex-col justify-center bg-brand-light-dark text-center scroll-mt-24 relative overflow-hidden py-24">
      
      {}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
            Gücümüzün Kaynağı: Teknoloji
          </h2>
          <p className="mt-4 text-lg text-brand-text-light max-w-3xl mx-auto leading-relaxed">
            Tarih Asistanı, en son bulut ve yapay zeka teknolojilerini kullanarak size en iyi deneyimi sunmak için tasarlandı. İşte perde arkası:
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {}
          <div className="group bg-brand-light-dark p-8 rounded-xl text-center border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-brand-accent/5">
            <div className="flex justify-center mb-6">
                {}
                <BrainCircuitIcon strokeWidth={2.5} className="h-14 w-14 text-brand-accent transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Gelişmiş Yapay Zeka</h3>
            <p className="text-brand-text-light leading-relaxed">
              Tarihi belgelerden anlamlı ve eleştirel sorular üretmek için Anthropic'in en güçlü modellerinden biri olan <strong>Claude 4.5 Haiku</strong>'yu kullanıyoruz.
            </p>
          </div>

          {}
          <div className="group bg-brand-light-dark p-8 rounded-xl text-center border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-brand-accent/5">
            <div className="flex justify-center mb-6">
                <CloudIcon strokeWidth={2.5} className="h-14 w-14 text-brand-accent transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Güvenilir Altyapı</h3>
            <p className="text-brand-text-light leading-relaxed">
              Tüm sistemimiz, dünyanın en ölçeklenebilir bulut platformu olan <strong>Amazon Web Services (AWS)</strong> üzerinde, yüksek performanslı ve güvenli bir şekilde çalışmaktadır.
            </p>
          </div>

          {}
          <div className="group bg-brand-light-dark p-8 rounded-xl text-center border border-slate-700/50 hover:border-brand-accent/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-brand-accent/5">
             <div className="flex justify-center mb-6">
                <AtomIcon strokeWidth={2.5} className="h-14 w-14 text-brand-accent transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Modern ve Hızlı Arayüz</h3>
            <p className="text-brand-text-light leading-relaxed">
              Kullandığınız bu akıcı arayüz, en modern web teknolojilerinden <strong>React</strong> ile geliştirilmiş olup, <strong>Vite</strong> sayesinde anlık derleme gücü sunmaktadır.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;