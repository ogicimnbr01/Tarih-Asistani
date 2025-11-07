// src/components/HeroSection.tsx
import React from 'react';
import { scrollToSection } from '../utils/scrollUtils'; // Yeni yardımcı fonksiyonu import edin

const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      style={{ backgroundImage: `url('/hero-background.jpg')` }}
      className="relative flex items-center min-h-screen bg-cover bg-center bg-no-repeat text-center text-white"
    >
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/grain-texture.png')`,
          mixBlendMode: 'overlay'
        }}
      ></div>
      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
          Geçmişin Derinliklerine <span className="text-brand-accent">Yolculuk Edin</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-brand-text-light">
          Yapay zeka aracılığıyla tarihi belgeleri 12. Sınıf İnkılap Tarihi dersi için anında çalışma kağıdına dönüştürün.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('generator'); // SADECE targetId gönderiyoruz, offset ve delay varsayılandan alınacak
            }}
            className="bg-brand-accent text-brand-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-accent-hover transition-transform duration-300 transform hover:scale-105 cursor-pointer"
          >
            Hemen Başla
          </a>
          <a
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('tanitim'); // SADECE targetId gönderiyoruz
            }}
            className="bg-transparent border-2 border-slate-600 text-brand-text font-bold py-3 px-8 rounded-lg text-lg hover:bg-slate-800 hover:border-slate-700 transition-colors duration-300 cursor-pointer"
          >
            Daha Fazla Bilgi
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;