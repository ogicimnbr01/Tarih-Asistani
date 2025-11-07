import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createPdf } from '../utils/pdfGenerator';

interface Unite { id: string; ad: string; }
interface Kazanim { id: string; ad: string; }
interface Kaynak { source_id: string; source_title: string; source_type: string; }
interface ApiResponse {
    source_url?: string;
    kullanilan_kaynak?: string;
    calisma_kagidi: string;
    source_citation?: string;
}

    const mockUniteler = [
        { id: "1", ad: "1. 20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya" },
        { id: "2", ad: "2. Milli Mücadele" },
        { id: "3", ad: "3. Atatürkçülük ve Türk İnkılabı" },
        { id: "4", ad: "4. İki Savaş Arasındaki Dönemde Türkiye ve Dünya" },
        { id: "5", ad: "5. II.Dünya Savaşı Sürecinde Türkiye ve Dünya" },
        { id: "6", ad: "6. II.Dünya Savaşı Sonrasında Türkiye ve Dünya" },
        { id: "7", ad: "7. Toplumsal Devrim Çağında Dünya ve Türkiye" },
        { id: "8", ad: "8. 21. Yüzyılın Eşiğinde Türkiye ve Dünya" }
    ];

    const mockKazanimlar = {
        "1": [
            { id: "1.1", ad: "1.1. Mustafa Kemal’in Birinci Dünya Savaşı’na kadarki eğitim ve askerlik hayatını içinde bulunduğu toplumun siyasi, sosyal ve kültürel yapısı ile ilişkilendirir" },
            { id: "1.2", ad: "1.2. 20. yüzyıl başlarında Osmanlı Devleti’nin siyasi, sosyal ve ekonomik durumunu analiz eder." },
            { id: "1.3", ad: "1.3. I. Dünya Savaşı sürecinde Osmanlı Devleti’nin durumunu siyasi, askerî ve sosyal açılardan analiz eder." },
            { id: "1.4", ad: "1.4. I. Dünya Savaşı’nın sonuçlarını Osmanlı Devleti ve Batılı devletler açısından değerlendirir." }
        ],
        "2": [
            { id: "2.1", ad: "2.1. Kuvay-ı Millîye hareketinin oluşumundan Büyük Millet Meclisinin açılışına kadar olan süreçte meydana gelen gelişmeleri açıklar." },
            { id: "2.2", ad: "2.2. Büyük Millet Meclisinin açılış sürecini ve sonrasında meydana gelen gelişmeleri kavrar." },
            { id: "2.3", ad: "2.3. Sevr Antlaşması’nın Millî Mücadele sürecine etkilerini analiz eder." },
            { id: "2.4", ad: "2.4. Doğu ve Güney Cephelerinde verilen mücadelelerin ülkemizin bağımsızlık sürecine katkılarını kavrar." },
            { id: "2.5", ad: "2.5. Düzenli ordunun kurulmasından Mudanya Ateşkes Antlaşması’na kadar meydana gelen gelişmeleri Türkiye’nin bağımsızlık sürecine katkıları açısından analiz eder." },
            { id: "2.6", ad: "2.6. Millî Mücadele sonucunda kazanılan diplomatik başarıları ülkemizin bağımsızlığı açısından değerlendirir.2.6. Millî Mücadele sonucunda kazanılan diplomatik başarıları ülkemizin bağımsızlığı açısından değerlendirir." },
            { id: "2.7", ad: "2.7. Millî Mücadele sürecine katkıda bulunmuş önemli şahsiyetlerin kişilik özellikleri ile faaliyetlerini ilişkilendirir." }
        ],
        "3": [
            { id: "3.1", ad: "3.1. Çağdaşlaşan Türkiye’nin temeli olan Atatürk ilkelerini kavrar." },
            { id: "3.2", ad: "3.2. Siyasi alanda meydana gelen gelişmeleri kavrar." },
            { id: "3.3", ad: "3.3. Hukuk alanında meydana gelen gelişmelerin Türk toplumunda meydana getirdiği değişimleri kavrar." },
            { id: "3.4", ad: "3.4. Eğitim ve kültür alanında yapılan inkılapları ve gelişmeleri kavrar." },
            { id: "3.5", ad: "3.5. Toplumsal alanda yapılan inkılapları ve meydana gelen gelişmeleri kavrar." },
            { id: "3.6", ad: "3.6. Ekonomi alanında meydana gelen gelişmeleri kavrar." },
            { id: "3.7", ad: "3.7. Atatürk Dönemi’nde sağlık alanında yapılan çalışmaları kavrar." },
            { id: "3.8", ad: "3.7. Atatürk ilke ve inkılaplarını oluşturan temel esasları Atatürkçü düşünce sistemi açısından analiz eder." },
        ],
        "4": [
            { id: "4.1", ad: "4.1. Atatürk Dönemi’nde Türkiye Cumhuriyeti’nin iç politikasındaki önemli gelişmeleri açıklar." },
            { id: "4.2", ad: "4.2. Atatürk Dönemi’nde (1923-1938) Türkiye Cumhuriyeti’nin dış politikasındaki başlıca gelişmeleri açıklar. " },
            { id: "4.3", ad: "4.3. İki dünya savaşı arasındaki dönemde dünyada meydana gelen siyasi ve ekonomik gelişmeleri kavrar." },
        ],
        "5": [
            { id: "5.1", ad: "5.1. II. Dünya Savaşı’nın sebepleri, başlaması ve yayılmasıyla ilgili başlıca gelişmeleri kavrar" },
            { id: "5.2", ad: "5.2. II. Dünya Savaşı sürecinde Türkiye’nin izlediği siyaset ile savaşın Türkiye üzerindeki ekonomik ve toplumsal etkilerini analiz eder." },
            { id: "5.3", ad: "5.3. II. Dünya Savaşı’nın sonuçlarını değerlendirir." },
        ],
        "6": [
            { id: "6.1", ad: "6.1. 1945-1950 yılları arasında Türkiye’de meydana gelen siyasi, sosyal ve ekonomik gelişmeleri kavrar." },
            { id: "6.2", ad: "6.2. II. Dünya Savaşı sonrası dönemde uluslararası ilişkilerde ve Türk dış politikasında meydana gelen gelişmeleri kavrar." },
            { id: "6.3", ad: "6.3. 1950’ler Türkiye’sinde meydana gelen siyasi, sosyal ve ekonomik gelişmeleri analiz eder." },
        ],
        "7": [
            { id: "7.1", ad: "7.1. 1960 sonrasında dünya siyasetinde ortaya çıkan gelişmeleri açıklar." },
            { id: "7.2", ad: "7.2. 1960’lardan itibaren Türk dış politikasını etkileyen önemli gelişmeleri kavrar." },
            { id: "7.3", ad: "7.3. 1960’lardan itibaren Türkiye’de meydana gelen siyasi, ekonomik ve sosyo-kültürel gelişmeleri analiz eder." },
        ],
        "8": [
            { id: "8.1", ad: "8.1. 1990 sonrasında Türkiye’de meydana gelen ekonomik, siyasi, sosyal ve kültürel gelişmeleri kavrar." },
            { id: "8.2", ad: "8.2. 1990 sonrasında meydana gelen siyasi gelişmeleri Türkiye’ye etkileri ve dünya siyasi konjonktürü bağlamında analiz eder." },
        ]
    };


const WorksheetGenerator: React.FC = () => {
    const [uniteler] = useState<Unite[]>(mockUniteler);
    const [kazanimlar, setKazanimlar] = useState<Kazanim[]>([]);
    const [kaynaklar, setKaynaklar] = useState<Kaynak[]>([]);
    const [selectedUnite, setSelectedUnite] = useState('');
    const [selectedKazanim, setSelectedKazanim] = useState('');
    const [selectedKaynak, setSelectedKaynak] = useState<string | null>(null);
    const [isLoadingKaynak, setIsLoadingKaynak] = useState(false);
    const [isLoadingWorksheet, setIsLoadingWorksheet] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const API_ENDPOINT_URL = 'https://duwr3ymxi6.execute-api.eu-central-1.amazonaws.com/';

    useEffect(() => { setSelectedKazanim(''); setKazanimlar(selectedUnite ? mockKazanimlar[selectedUnite as keyof typeof mockKazanimlar] || [] : []); }, [selectedUnite]);
    useEffect(() => { const fetchKaynaklar = async () => { if (!selectedUnite || !selectedKazanim) { setKaynaklar([]); setSelectedKaynak(null); return; } setIsLoadingKaynak(true); setError(null); setKaynaklar([]); setSelectedKaynak(null); try { const response = await fetch(API_ENDPOINT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unit_id: selectedUnite, outcome_id: selectedKazanim }), }); if (!response.ok) throw new Error('Kaynaklar sunucudan alınamadı.'); const data: Kaynak[] = await response.json(); setKaynaklar(data); } catch (err: any) { setError(err.message || 'Kaynakları yüklerken bir hata oluştu.'); } finally { setIsLoadingKaynak(false); } }; fetchKaynaklar(); }, [selectedKazanim, selectedUnite]);
    useEffect(() => { setApiResponse(null); }, [selectedUnite, selectedKazanim, selectedKaynak]);
    const handleCreateWorksheet = async () => { if (!selectedUnite || !selectedKaynak) { setError("Lütfen bir ünite ve kaynak seçiniz."); return; } setIsLoadingWorksheet(true); setError(null); setApiResponse(null); try { const response = await fetch(API_ENDPOINT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unit_id: selectedUnite, source_id: selectedKaynak }), }); const data: ApiResponse = await response.json(); if (!response.ok) throw new Error((data as any).message || `Sunucu hatası`); setApiResponse(data); } catch (err: any) { setError(err.message || 'Çalışma kağıdı oluşturulurken bir hata oluştu.'); } finally { setIsLoadingWorksheet(false); } };
    
    const handleDownloadPdf = async () => {
      if (!apiResponse) {
        alert("PDF oluşturmak için önce bir çalışma kağıdı oluşturmalısınız.");
        return;
      }
      setIsGeneratingPdf(true);
      try {
        const unitKazanimlari = mockKazanimlar[selectedUnite as keyof typeof mockKazanimlar] || [];
        const seciliKazanimObjesi = unitKazanimlari.find(k => k.id === selectedKazanim);
        const kazanimMetni = seciliKazanimObjesi ? seciliKazanimObjesi.ad.substring(seciliKazanimObjesi.id.length + 1).trim() : "Belirtilmemiş Kazanım";
        const reportData = {
          seciliKazanimMetni: kazanimMetni,
          kaynakKunyesi: apiResponse.source_citation || "Kaynak Belirtilmemiş",
          calismaKagidiMetni: apiResponse.calisma_kagidi,
          kaynakMetni: apiResponse.kullanilan_kaynak || null,
          sourceImageUrl: apiResponse.source_url && apiResponse.source_url.match(/\.(jpeg|jpg|gif|png)$/) ? apiResponse.source_url : null
        };
        await createPdf(reportData);
      } catch (error) {
        console.error(error);
        alert("PDF oluşturulurken bir hata oluştu. Lütfen konsolu kontrol ediniz.");
      } finally {
        setIsGeneratingPdf(false);
      }
    };

    const getKaynakIcon = (type: string) => { const sourceType = (type || 'belge').toLowerCase(); if (sourceType === 'gazete') return '📰'; if (sourceType === 'hatirat') return '📖'; if (sourceType === 'mektup') return '✉️'; return '📜'; };
    
    return (
        <section id="generator" className="min-h-screen flex items-center">
            <div className="container mx-auto px-6">
                <div className="bg-brand-light-dark rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700/50">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">İnkılap Tarihi Akıllı Çalışma Kağıdı Asistanı</h2>
                        <p className="mt-4 text-lg text-brand-text-light max-w-3xl mx-auto">MEB kazanımlarına uygun, yapay zeka ile eleştirel düşünce soruları ve PDF çalışma kağıtları hazırlayın.</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="unite-secimi" className="block text-brand-text font-bold mb-2">Ünite Seçimi:</label>
                                <select id="unite-secimi" value={selectedUnite} onChange={e => setSelectedUnite(e.target.value)} className="w-full bg-brand-dark border-2 border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none">
                                    <option value="">Lütfen bir ünite seçiniz</option>
                                    {uniteler.map(unite => <option key={unite.id} value={unite.id}>{unite.ad}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="kazanim-secimi" className="block text-brand-text font-bold mb-2">Kazanım Seçimi:</label>
                                <select id="kazanim-secimi" value={selectedKazanim} onChange={e => setSelectedKazanim(e.target.value)} disabled={!selectedUnite} className="w-full bg-brand-dark border-2 border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none disabled:opacity-50">
                                    <option value="">Lütfen bir kazanım seçiniz</option>
                                    {kazanimlar.map(kazanim => <option key={kazanim.id} value={kazanim.id}>{kazanim.ad}</option>)}
                                </select>
                            </div>
                        </div>
                        {}
                        <div className="mb-8">
                            <label className="block text-brand-text font-bold mb-2">Kaynak Seçimi:</label>
                            <div className="bg-brand-dark border-2 border-slate-700 rounded-lg p-4 min-h-[150px]">
                                {isLoadingKaynak ? <p className="text-brand-text-light">Kaynaklar yükleniyor...</p> : !selectedKazanim ? <p className="text-brand-text-light">Lütfen önce bir kazanım seçiniz.</p> : kaynaklar.length === 0 ? <p className="text-brand-text-light">Bu kazanıma ait kaynak bulunamadı.</p> : <div className="space-y-2">{kaynaklar.map(kaynak => (<div key={kaynak.source_id} onClick={() => setSelectedKaynak(kaynak.source_id)} className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${selectedKaynak === kaynak.source_id ? 'bg-brand-accent/20 border-brand-accent' : 'hover:bg-slate-700/50'}`}><span className="text-2xl mr-3" title={kaynak.source_type}>{getKaynakIcon(kaynak.source_type)}</span><span className="text-brand-text">{kaynak.source_title}</span></div>))}</div>}
                            </div>
                        </div>
                        {}
                        <div className="flex justify-center">
                            <button onClick={handleCreateWorksheet} disabled={!selectedKaynak || isLoadingWorksheet} className="bg-brand-accent text-brand-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-accent-hover transition-all duration-300 transform hover:scale-105 shadow-lg shadow-brand-accent/20 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center">
                            
                            {isLoadingWorksheet ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                    Oluşturuluyor...
                                    </>
                                ) : (
                                    'Çalışma Kağıdı Oluştur'
                                )}
                            </button>
                        </div>
                        {error && <div className="mt-8 text-center bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">{error}</div>}
                        {apiResponse && (
                            <div className="mt-12 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-white mb-4 border-b-2 border-brand-accent/50 pb-2">Kullanılan Birinci Elden Kaynak:</h3>
                                    <div className="bg-brand-dark p-6 rounded-lg border border-slate-700 space-y-4">
                                        {apiResponse.source_url && apiResponse.source_url.match(/\.(jpeg|jpg|gif|png)$/) != null && (<img src={apiResponse.source_url} alt="Kaynak Görseli" className="max-w-full rounded-md mx-auto" />)}
                                        {apiResponse.kullanilan_kaynak && <p className="text-brand-text-light whitespace-pre-wrap">{apiResponse.kullanilan_kaynak}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-white mb-4 border-b-2 border-brand-accent/50 pb-2">Oluşturulan Çalışma Kağıdı:</h3>
                                    <div className="bg-brand-dark p-6 rounded-lg border border-slate-700">
                                        <div className="text-brand-text-light whitespace-pre-wrap leading-relaxed">{apiResponse.calisma_kagidi}</div>
                                        <div className="text-center mt-8">
                                            {}
                                            <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                                                {isGeneratingPdf ? 'Oluşturuluyor...' : 'PDF Olarak İndir'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                         <div className="text-center mt-12 text-xs text-brand-text-light max-w-3xl mx-auto">
                           <p>📜 Bu platformda yer alan belgeler kamuya açık arşivlerden (Atatürk Kitaplığı, SALT Araştırma, Devlet Arşivleri vb.) alınmıştır. Tüm materyaller yalnızca eğitim ve araştırma amaçlı kullanılmakta olup, ilgili kurumların Creative Commons lisans koşullarına tabidir. Bu platform ticari amaç gütmemekte olup, arşiv materyalleri ilgili kurumların mülkiyetindedir. Herhangi bir hak ihlali tespit edilmesi durumunda ilgili içerik derhal kaldırılacaktır.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WorksheetGenerator;