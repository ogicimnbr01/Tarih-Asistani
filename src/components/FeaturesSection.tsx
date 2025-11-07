import React from 'react';
import { FEATURES } from '../../constants';
import { Feature } from '../../types'; 

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
    <div 
      className="bg-brand-light-dark p-6 rounded-lg text-center border border-slate-700/50 h-full 
                 transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-accent/10"
    >
        <div className="text-4xl mb-4 inline-block text-brand-accent">{feature.icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-brand-text-light">{feature.description}</p>
    </div>
);


const FeaturesSection: React.FC = () => {
    return (
        <section id="ozellikler" className="min-h-screen flex flex-col justify-center scroll-mt-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Neden Tarih Asistanı?</h2>
                    <p className="mt-4 text-lg text-brand-text-light max-w-2xl mx-auto">T.C. İnkılap Tarihi ve Atatürkçülük dersleriniz için en pratik yardımcınız.</p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {FEATURES.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;