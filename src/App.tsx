import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import WorksheetGenerator from './components/WorksheetGenerator';
import FeaturesSection from './components/FeaturesSection';
import ShowcaseSection from './components/ShowcaseSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import ResourceStatusSection from './components/ResourceStatusSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-brand-dark min-h-screen text-brand-text font-sans antialiased relative">
      {}
      <div
        className="absolute inset-0 z-0 bg-brand-dark"
        style={{
          backgroundImage: `url('/paper-texture.png')`,
          opacity: 0.05, 
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
          mixBlendMode: 'overlay',
        }}
      ></div>

      {}
      <div className="relative z-10">
        {}
        <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/[0.05] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div> {}

        <Header />

        <main className="relative z-10">
          <HeroSection />
          <WorksheetGenerator />
          <FeaturesSection />
          <ShowcaseSection />
          <TestimonialsSection />
          <CTASection />
        </main>

        <ResourceStatusSection />
        <Footer />
      </div>
    </div>
  );
};

export default App;