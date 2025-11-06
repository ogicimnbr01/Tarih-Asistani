import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import WorksheetGenerator from './components/WorksheetGenerator';
import FeaturesSection from './components/FeaturesSection';
import ShowcaseSection from './components/ShowcaseSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="bg-brand-dark min-h-screen text-brand-text font-sans antialiased overflow-x-hidden scroll-smooth">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/[0.2] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <WorksheetGenerator />
          <FeaturesSection />
          <ShowcaseSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;