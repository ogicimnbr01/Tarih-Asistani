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
    <div className="bg-brand-dark min-h-screen text-brand-text font-sans antialiased">
      {}
      <div className="relative">

        {}
        <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>

        {}
        <Header />

        {}
        <main className="relative z-10">
          <HeroSection />
          <WorksheetGenerator />
          <FeaturesSection />
          <ShowcaseSection />
          <TestimonialsSection />
          <CTASection />
          <ResourceStatusSection /> {}
        </main>

        {}
        <Footer />
      </div>
    </div>
  );
};

export default App;