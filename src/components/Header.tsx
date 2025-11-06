import React, { useState, useEffect } from 'react';

const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
  event.preventDefault();
  const elementId = targetId.startsWith('#') ? targetId.substring(1) : targetId;
  const targetElement = document.getElementById(elementId);
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const Header: React.FC = () => {
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
    { href: '#ozellikler', label: 'Özellikler' },
    { href: '#tanitim', label: 'Tanıtım' },
    { href: '#yorumlar', label: 'Yorumlar' },
    { href: '#teknoloji', label: 'Teknik Detaylar' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isScrolled ? 'translate-y-0' : '-translate-y-full'} bg-brand-dark/80 backdrop-blur-md border-b border-slate-700/50`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-serif font-bold text-white">
          Tarih Asistanı
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={(e) => handleScroll(e, link.href)}
              className="text-brand-text-light hover:text-brand-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        {}
        <div className="hidden md:flex">
            <a 
              href="#generator" 
              onClick={(e) => handleScroll(e, 'generator')}
              className="bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-brand-accent-hover transition-colors"
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
                href={link.href}
                onClick={(e) => { handleScroll(e, link.href); setIsOpen(false); }}
                className="block py-2 text-brand-text-light hover:text-brand-accent"
              >
                {link.label}
              </a>
            ))}
            {}
            <a 
              href="#generator" 
              onClick={(e) => { handleScroll(e, 'generator'); setIsOpen(false); }}
              className="block w-full text-center mt-4 bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-brand-accent-hover transition-colors"
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