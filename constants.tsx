import { BrainCircuitIcon, BookOpenIcon, PrinterIcon } from 'lucide-react';
import { Feature, Testimonial } from './types';



export const FEATURES: Feature[] = [
  {
    icon: <BookOpenIcon className="h-8 w-8 text-brand-accent" />,
    title: 'Özgün Kaynaklarla Derinleşme',
    description: 'MEB müfredatıyla tam uyumlu, birinci elden tarihi belgeler üzerinden ders işleyin. Sürekli genişleyen kaynak havuzumuzla tarihe dokunma fırsatı verin.',
  },
  {
    icon: <BrainCircuitIcon className="h-8 w-8 text-brand-accent" />,
    title: 'Yapay Zeka Destekli Sorular',
    description: 'Seçtiğiniz kaynaktan, eleştirel düşünmeyi ölçen özgün soruları saniyeler içinde hazırlayın. Ezber bozan, yoruma dayalı sorularla derslerinizi zenginleştirin.',
  },
  {
    icon: <PrinterIcon className="h-8 w-8 text-brand-accent" />,
    title: 'Profesyonel Ders Materyalleri',
    description: 'Tek tıkla, şık ve düzenli PDF çalışma kağıtları oluşturun. Yazıcı dostu tasarımıyla materyallerinizi kolayca bastırın ve hemen kullanmaya başlayın.',
  },
];

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: `2002'de "Tarih Derslerinde "Dokümanlarla Öğretim” Yaklaşımı" adlı yazımda önerdiğim bazı hususları 2025'te sanal ortamda Tarih Asistanı ile yapan öğrencim Oğuzhan Başsarı'yı tebrik ederim. Başarılarının devamını dilerim. İnşallah bu site "Tarihçi şahsiyetine sahip" gençlerin sayısını arttıracaktır.`,
        name: "Prof. Dr. Bahri Ata",
        title: "Tarih Eğitimi Profesörü, Gazi Üniversitesi",
        avatarUrl: "https://i.imgur.com/NczrmG2.png",
    },
    {
        quote: "Öğrencilerim için ders materyali hazırlarken Tarih Asistanı'nın görselleştirme araçları sayesinde konuları çok daha ilgi çekici hale getirebiliyorum.",
        name: "xxxxxxx",
        title: "Tarih Öğretmeni, Lise",
        avatarUrl: "https://i.pravatar.cc/150?u=ahmet-kaya", // <-- YENİ
    },
    {
        quote: "Merak ettiğim herhangi bir tarihi olayı saniyeler içinde, güvenilir kaynaklarla öğrenmek harika bir deneyim. Her tarih meraklısına tavsiye ederim.",
        name: "xxxxxxxxxx",
        title: "Tarih Meraklısı",
        avatarUrl: "https://i.pravatar.cc/150?u=zeynep-arslan", // <-- YENİ
    },
];