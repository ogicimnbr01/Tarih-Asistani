import React, { useState, useEffect } from 'react';
import { scrollToSection } from '../utils/scrollUtils';

const Header: React.FC = () => {
  console.log('Header bileşeni render edildi!');

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScrollEvent);
    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);

  const navLinks = [
    { targetId: 'ozellikler', label: 'Özellikler' },
    { targetId: 'tanitim', label: 'Tanıtım' },
    { targetId: 'yorumlar', label: 'Yorumlar' },
    { targetId: 'teknoloji', label: 'Teknik Detaylar' },
    { targetId: 'kaynak-durumu', label: 'Kaynak Durumu' },
  ];

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    console.log('Navigasyon linki tıklandı, hedef ID:', targetId);
    scrollToSection(targetId);
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out
                 ${isScrolled ? 'translate-y-0' : '-translate-y-full'}
                 bg-brand-dark/80 backdrop-blur-md border-b border-slate-700/50`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a
          onClick={(e) => handleNavLinkClick(e, 'hero')}
          className="text-xl font-serif font-bold text-white cursor-pointer"
        >
          Tarih Asistanı
        </a>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              onClick={(e) => handleNavLinkClick(e, link.targetId)}
              className="text-brand-text-light hover:text-brand-accent transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
            <a
              onClick={(e) => handleNavLinkClick(e, 'generator')}
              className="bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-brand-accent-hover transition-colors cursor-pointer"
            >
              Oluşturmaya Başla
            </a>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brand-light-dark">
          <nav className="px-6 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                onClick={(e) => handleNavLinkClick(e, link.targetId)}
                className="block py-2 text-brand-text-light hover:text-brand-accent cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <a
              onClick={(e) => handleNavLinkClick(e, 'generator')}
              className="block w-full text-center mt-4 bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-brand-accent-hover transition-colors cursor-pointer"
            >
              Oluşturmaya Başla
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;