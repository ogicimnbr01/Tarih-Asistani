import React, { useState } from 'react';
import { BookOpen, Mail, ExternalLink, History, Github, FileText, X, Linkedin } from 'lucide-react';

type ModalType = 'privacy' | 'terms' | null;

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const closeModal = () => setActiveModal(null);

    const renderModalContent = () => {
        if (activeModal === 'privacy') {
            return (
                <div className="space-y-4 text-gray-300 text-sm font-inter">
                    <h3 className="text-xl font-serif text-brand-gold mb-4">Gizlilik Politikası</h3>
                    <p>Tarih Asistanı olarak veri güvenliğinize önem veriyoruz.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Platformumuzda üyelik sistemi yoktur. Adınız, e-postanız veya kişisel bilgileriniz hiçbir şekilde veritabanımıza kaydedilmez.</li>
                        <li>Oluşturduğunuz çalışma kağıtları ve seçimleriniz, sadece o anki işlemi gerçekleştirmek için anlık olarak işlenir ve işlem bittiğinde sistemden silinir.</li>
                        <li>Hizmetin çalışması için gerekli olan teknik veriler (IP adresi vb.) sunucu sağlayıcımız (AWS) tarafından standart güvenlik protokolleri çerçevesinde otomatik olarak yönetilir.</li>
                        <li>Sitemizde reklam veya takip (tracking) çerezleri bulunmamaktadır. Sadece sitenin çalışması için zorunlu teknik çerezler kullanılır.</li>
                    </ul>
                    <p className="italic text-gray-500 mt-4">Son Güncelleme: Kasım 2025</p>
                </div>
            );
        }
        if (activeModal === 'terms') {
            return (
                <div className="space-y-4 text-gray-300 text-sm font-inter">
                    <h3 className="text-xl font-serif text-brand-gold mb-4">Kullanım Şartları</h3>
                    <p>Bu hizmeti kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Üretilen içerikler sadece eğitim amaçlıdır ve akademik referans olarak kullanılamaz.</li>
                        <li>Sistem tarafından üretilen bilgilerin doğruluğu (MEB müfredatı ve tarihi gerçeklik) kullanıcının sorumluluğundadır. Tarih Asistanı, olası yanlış bilgilerden dolayı sorumluluk kabul etmez.</li>
                        <li>Oluşturulan çalışma kağıtları satılamaz, sadece öğretmen/öğrenci tarafından ders materyali olarak kullanılabilir.</li>
                        <li>Bu bir beta sürümüdür. Hizmetin kesintisiz çalışacağı garanti edilmez; site yönetimi haber vermeksizin hizmeti durdurma hakkını saklı tutar.</li>
                        <li>İçerikler yapay zeka ile üretildiğinden, kullanmadan önce mutlaka bir eğitimci tarafından kontrol edilmelidir.</li>
                    </ul>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <footer className="bg-brand-dark border-t border-brand-gold/20 pt-16 pb-8 relative overflow-hidden font-sans">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        
                        {}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 text-brand-gold">
                                <div className="p-2 bg-brand-gold/10 rounded-lg border border-brand-gold/20">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <span className="font-serif font-bold text-xl tracking-tight text-white">
                                    Tarih Asistanı
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed font-light">
                                Geçmişi anlamak, geleceği şekillendirmektir. 12. Sınıf T.C. İnkılap Tarihi dersi için yapay zeka destekli eğitim materyalleri.
                            </p>
                            <a href="mailto:oguz.bassari11@gmail.com" className="inline-flex items-center gap-2 text-brand-gold hover:text-white transition-colors text-sm font-medium w-fit">
                                <Mail className="w-4 h-4" />
                                oguz.bassari11@gmail.com
                            </a>
                        </div>

                        {}
                        <div>
                            <h3 className="font-serif text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-gold"></span>
                                Keşfet
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><a href="#tanitim" className="hover:text-brand-gold hover:pl-2 transition-all block w-fit">Nasıl Çalışır?</a></li>
                                <li><a href="#ozellikler" className="hover:text-brand-gold hover:pl-2 transition-all block w-fit">Özellikler</a></li>
                                <li><a href="#generator" className="hover:text-brand-gold hover:pl-2 transition-all block w-fit">Çalışma Kağıdı Oluştur</a></li>
                                <li><a href="#sss" className="hover:text-brand-gold hover:pl-2 transition-all block w-fit">Sıkça Sorulan Sorular</a></li>
                            </ul>
                        </div>

                        {}
                        <div>
                            <h3 className="font-serif text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-gold"></span>
                                Resmi Kaynaklar
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li><a href="https://mufredat.meb.gov.tr/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold flex gap-2 items-center w-fit"><ExternalLink className="w-3 h-3"/> MEB Öğretim Programları</a></li>
                                <li><a href="https://www.devletarsivleri.gov.tr/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold flex gap-2 items-center w-fit"><History className="w-3 h-3"/> Devlet Arşivleri Bşk.</a></li>
                                <li><a href="https://www.ttk.gov.tr/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold flex gap-2 items-center w-fit"><BookOpen className="w-3 h-3"/> Türk Tarih Kurumu</a></li>
                            </ul>
                        </div>

                        {}
                        <div>
                            <h3 className="font-serif text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-brand-gold"></span>
                                Yasal Bilgilendirme
                            </h3>
                            <div className="p-4 bg-black/30 border border-brand-gold/10 rounded-lg backdrop-blur-sm">
                                <div className="flex gap-2 mb-2 text-brand-gold">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Sorumluluk Reddi</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                    Bu uygulama eğitim amaçlıdır. İçeriklerin doğruluğu, birincil kaynaklarla teyit edilmelidir.
                                </p>
                                <div className="flex gap-3 text-xs text-gray-400 border-t border-white/5 pt-2">
                                    <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors focus:outline-none">Gizlilik</button>
                                    <span className="text-gray-700">•</span>
                                    <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors focus:outline-none">Kullanım Şartları</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-gray-500">&copy; {currentYear} Tarih Asistanı. Tüm hakları saklıdır.</p>
                        
                        {}
                        <div className="flex items-center gap-6">
                            {}
                            <a 
                                href="https://www.linkedin.com/in/oguzhanbassari80" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 group"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity -ml-1 hidden sm:inline-block">Bağlantı Kur</span>
                            </a>

                            {}
                            <a 
                                href="https://github.com/ogicimnbr01/Tarih-Asistani" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 group"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity -ml-1 hidden sm:inline-block">Kodları İncele</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-brand-dark border border-brand-gold/30 rounded-xl w-full max-w-2xl relative shadow-2xl shadow-black/50 animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-brand-gold/10">
                            <div className="flex items-center gap-2 text-brand-gold">
                                <FileText className="w-5 h-5" />
                                <span className="font-serif font-bold">Yasal Doküman</span>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {renderModalContent()}
                        </div>
                        <div className="p-4 border-t border-brand-gold/10 bg-black/20 flex justify-end rounded-b-xl">
                            <button 
                                onClick={closeModal}
                                className="px-6 py-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded hover:bg-brand-gold hover:text-brand-dark transition-all text-sm font-bold"
                            >
                                Anlaşıldı
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;