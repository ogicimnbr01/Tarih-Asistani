import React from 'react';
import { scrollToSection } from '../utils/scrollUtils';

const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      style={{ backgroundImage: `url('/hero-background.jpg')` }}
      className="relative flex items-center min-h-screen bg-cover bg-center bg-no-repeat text-center text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/grain-texture.png')`,
          mixBlendMode: 'overlay'
        }}
      ></div>

      {}
      <div className="absolute inset-0 z-[5] pointer-events-none hidden md:block">
        {}
        <img
          src="/gazete1.jpg"
          alt="Tarihi Gazete 1"
          className="absolute top-[10%] left-[5%] w-[280px] rotate-[-12deg] opacity-10 mix-blend-overlay" 
        />
        {}
        <img
          src="/gazete2.jpg"
          alt="Tarihi Gazete 2"
          className="absolute top-[10%] right-[10%] w-[320px] rotate-[8deg] opacity-10 mix-blend-overlay" 
        />
        {}
        <img
          src="/gazete3.jpg"
          alt="Tarihi Gazete 3"
          className="absolute bottom-[1%] left-[15%] w-[300px] rotate-[3deg] opacity-10 mix-blend-overlay" 
        />
      </div>

      {}
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white/5 p-6 rounded-lg backdrop-blur-sm mx-auto max-w-2xl shadow-xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
            Tarihi Belgeyle <span className="text-brand-accent-hover">Keşfedin</span> {}
          </h1>
          <p className="mt-6 text-lg text-brand-text-light leading-relaxed">
            12. Sınıf İnkılap Tarihi için, birinci elden belgelerle tarihi düşünme becerilerinizi geliştirin.
          </p>
          <div className="mt-10 flex flex-col md:flex-row justify-center gap-4">
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('generator');
              }}
              className="bg-brand-accent text-brand-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-accent-hover transition-transform duration-300 transform hover:scale-105 cursor-pointer w-full md:w-auto"
            >
              Çalışma Kağıdı Oluştur
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features'); 
              }}
              className="bg-transparent border-2 border-slate-600 text-brand-text font-bold py-3 px-8 rounded-lg text-lg hover:bg-slate-800 hover:border-slate-700 transition-colors duration-300 cursor-pointer w-full md:w-auto"
            >
              Sistemi İncele {}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;