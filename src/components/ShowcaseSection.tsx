import React from 'react';

const ShowcaseSection: React.FC = () => {
  return (
    <section id="tanitim" className="min-h-screen flex items-center bg-brand-light-dark scroll-mt-18"> 
      <div className="container mx-auto px-6 py-20 lg:py-0">
        
        {}
        {}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          
          {}
          <div className="lg:w-2/3 text-center lg:text-left"> 
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              3 Adımda Akıllı Çalışma Kağıtları
            </h2>
            <p className="text-lg text-brand-text-light mb-6 max-w-xl mx-auto lg:mx-0"> 
              MEB müfredatından ünitenizi ve kazanımınızı seçin, ardından ilgili tarihi belgeyi belirleyin. Yapay zeka, seçtiğiniz belgeyi analiz ederek saniyeler içinde size özel sorular hazırlasın.
            </p>
            
            {}
            <ul className="space-y-4 inline-block text-left">
              <li className="flex items-start">
                <CheckmarkIcon />
                <span className="ml-3 text-brand-text">MEB Kazanımlarıyla Uyumlu</span>
              </li>
              <li className="flex items-start">
                <CheckmarkIcon />
                <span className="ml-3 text-brand-text">AI Destekli Özgün Sorular</span>
              </li>
              <li className="flex items-start">
                <CheckmarkIcon />
                <span className="ml-3 text-brand-text">Yazıcı Dostu PDF Çıktısı</span>
              </li>
            </ul>
          </div>

          <div className="lg:w-1/3 w-full max-w-sm">
            <div 
              className="rounded-xl overflow-hidden border-4 border-slate-700/50 
                         transform lg:rotate-3 hover:rotate-0 transition-transform duration-500 
                         drop-shadow-2xl hover:drop-shadow-xl" 
            >
                <img 
                  src="/showcase-image.jpeg" 
                  alt="Tarih Asistanı ile oluşturulmuş çalışma kağıdı örneği" 
                  className="w-full h-auto object-cover"
                />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const CheckmarkIcon: React.FC = () => (
    <svg className="flex-shrink-0 h-6 w-6 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default ShowcaseSection;