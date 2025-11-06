import React from 'react';
import { TESTIMONIALS } from '../../constants';
import { Testimonial } from '../../types';

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="bg-brand-light-dark p-8 rounded-xl shadow-lg flex flex-col h-full border border-slate-700/50">
        <div className="flex-grow">
            <p className="text-brand-text italic">"{testimonial.quote}"</p>
        </div>
        <div className="flex items-center mt-6">
            <img className="h-12 w-12 rounded-full object-cover" src={testimonial.avatarUrl} alt={testimonial.name} />
            <div className="ml-4">
                <p className="font-bold text-white">{testimonial.name}</p>
                <p className="text-sm text-brand-text-light">{testimonial.title}</p>
            </div>
        </div>
    </div>
);

const TestimonialsSection: React.FC = () => {
    return (
        <section id="yorumlar" className="min-h-screen flex flex-col justify-center py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Kullanıcılarımız Ne Diyor?</h2>
                    <p className="mt-4 text-lg text-brand-text-light max-w-2xl mx-auto">Topluluğumuzun Tarih Asistanı ile deneyimleri.</p>
                </div>
                {}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;