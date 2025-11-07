import React from 'react';
import { TESTIMONIALS } from '../../constants';
import { Testimonial } from '../../types';

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div 
    className="bg-brand-light-dark p-8 rounded-xl border border-slate-700/50 h-full
               transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-accent/10"
  >
    <p className="text-brand-text-light mb-6 italic">"{testimonial.quote}"</p>
    <div className="flex items-center">
      <img 
        src={testimonial.avatarUrl} 
        alt={testimonial.name}
        className="h-12 w-12 rounded-full mr-4 object-cover"
      />
      <div>
        <p className="font-bold text-white">{testimonial.name}</p>
        <p className="text-sm text-brand-text-light">{testimonial.title}</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection: React.FC = () => {
  return (
    <section id="yorumlar" className="min-h-screen flex flex-col justify-center bg-brand-dark scroll-mt-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Kullanıcılarımız Ne Diyor?</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;