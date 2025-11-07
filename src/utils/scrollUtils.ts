// src/utils/scrollUtils.ts

/**
 * Belirtilen ID'ye sahip bir bölüme sorunsuz bir şekilde kaydırır.
 * Header'ın yüksekliğini dinamik olarak hesaplayarak içeriğin Header'ın altına girmesini engeller.
 * Kaydırma işleminden önce kısa bir gecikme eklenir.
 *
 * @param sectionId - Hedef bölümün ID'si (örneğin "generator").
 * @param [offset=0] - Header'ın altından ek boşluk (piksel cinsinden).
 * @param [delay=0] - Kaydırma işleminden önce beklenecek süre (milisaniye cinsinden). <-- BURAYI 0 YAPIYORUZ
 */
export const scrollToSection = (sectionId: string, offset: number = 0, delay: number = 0) => { 
  console.log('--- scrollToSection çağrıldı ---');
  console.log('Hedef ID:', sectionId);
  console.log('Kullanılan offset:', offset);
  console.log('Kullanılan gecikme (ms):', delay);

  setTimeout(() => {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    console.log('Header Yüksekliği (offsetHeight - gecikme sonrası):', headerHeight);

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      const rect = targetSection.getBoundingClientRect();
      console.log('targetSection.getBoundingClientRect().top (viewporta göre - gecikme sonrası):', rect.top);
      console.log('window.scrollY (mevcut kaydırma miktarı - gecikme sonrası):', window.scrollY);

      const targetPosition = rect.top + window.scrollY;
      console.log('Hedef Bölümün Mutlak Top Konumu (rect.top + window.scrollY - gecikme sonrası):', targetPosition);

      const finalScrollPosition = targetPosition - headerHeight - offset;
      console.log('Nihai Kaydırma Konumu (Hesaplanan - gecikme sonrası):', finalScrollPosition);
      console.log('Nihai Kaydırma Konumu TİPİ:', typeof finalScrollPosition);

      window.scrollTo({
        top: finalScrollPosition,
        behavior: 'smooth'
      });
      console.log('window.scrollTo çağrıldı, gönderilen top değeri:', finalScrollPosition);
    } else {
      console.warn('Hedef bölüm bulunamadı:', sectionId);
    }
    console.log('--- scrollToSection bitti ---');
  }, delay); 
};