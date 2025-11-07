import React from 'react';
import { BrainCircuitIcon, CloudIcon, AtomIcon } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section id="teknoloji" className="min-h-screen flex flex-col justify-center bg-brand-light-dark text-center scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
            Gücümüzün Kaynağı: Teknoloji
          </h2>
          <p className="mt-4 text-lg text-brand-text-light max-w-3xl mx-auto">
            Tarih Asistanı, en son bulut ve yapay zeka teknolojilerini kullanarak size en iyi deneyimi sunmak için tasarlandı. İşte perde arkası:
          </p>
        </div>

        {}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {}
          <div className="bg-brand-light-dark p-8 rounded-lg text-center border border-slate-700/50">
            <BrainCircuitIcon className="h-10 w-10 text-brand-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Gelişmiş Yapay Zeka</h3>
            <p className="text-brand-text-light">
              Tarihi belgelerden anlamlı ve eleştirel sorular üretmek için Anthropic'in en güçlü modellerinden biri olan <strong>Claude 4.5 Haiku</strong>'yu kullanıyoruz.
            </p>
          </div>

          {}
          <div className="bg-brand-light-dark p-8 rounded-lg text-center border border-slate-700/50">
            <CloudIcon className="h-10 w-10 text-brand-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Güvenilir Altyapı</h3>
            <p className="text-brand-text-light">
              Tüm sistemimiz, dünyanın en ölçeklenebilir bulut platformu olan <strong>Amazon Web Services (AWS)</strong> üzerinde, yüksek performanslı ve güvenli bir şekilde çalışmaktadır.
            </p>
          </div>

          {}
          <div className="bg-brand-light-dark p-8 rounded-lg text-center border border-slate-700/50">
            <AtomIcon className="h-10 w-10 text-brand-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Modern ve Hızlı Arayüz</h3>
            <p className="text-brand-text-light">
              Kullandığınız bu akıcı arayüz, en modern web teknolojilerinden <strong>React</strong> ile geliştirilmiş olup, <strong>Vite</strong> sayesinde anlık derleme gücü sunmaktadır.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;