import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "İçerikler MEB müfredatına tam uyumlu mu?",
    answer: "Evet, Tarih Asistanı'nın ürettiği tüm çalışma kağıtları ve sorular, güncel 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi öğretim programı kazanımları baz alınarak hazırlanır."
  },
  {
    question: "Oluşturulan materyalleri PDF olarak indirebilir miyim?",
    answer: "Kesinlikle. Hazırladığınız çalışma kağıtlarını tek tıkla, yazdırmaya hazır formatta PDF olarak indirebilirsiniz."
  },
  {
    question: "Kaynaklar ne kadar güvenilir?",
    answer: "Sistemimiz, sadece Türk Tarih Kurumu, Devlet Arşivleri ve MEB ders kitapları gibi birincil ve resmi kaynaklardan beslenir. Halüsinasyon (uydurma bilgi) riski minimize edilmiştir."
  },
  {
    question: "Bu servisi kullanmak ücretli mi?",
    answer: "Tarih Asistanı şu anda Beta aşamasındadır ve öğretmenlerimiz için tamamen ücretsizdir."
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="sss" className="py-20 relative z-10 scroll-mt-18">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-brand-gold mb-3">
            <HelpCircle className="w-6 h-6" />
            <span className="font-bold tracking-wider text-sm uppercase">Merak Edilenler</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border transition-all duration-300 rounded-lg overflow-hidden ${
                openIndex === index 
                  ? 'bg-brand-light-dark/50 border-brand-gold/30 shadow-lg shadow-brand-gold/5' 
                  : 'bg-transparent border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <span className={`font-medium text-lg ${openIndex === index ? 'text-brand-gold' : 'text-gray-300'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-brand-gold" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <div 
                className={`px-5 text-gray-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;