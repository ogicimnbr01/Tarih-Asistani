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
        avatarUrl: "https://i.pravatar.cc/150?u=ahmet-kaya", 
    },
    {
        quote: "Merak ettiğim herhangi bir tarihi olayı saniyeler içinde, güvenilir kaynaklarla öğrenmek harika bir deneyim. Her tarih meraklısına tavsiye ederim.",
        name: "xxxxxxxxxx",
        title: "Tarih Meraklısı",
        avatarUrl: "https://i.pravatar.cc/150?u=zeynep-arslan", 
    },
];

export interface UnitResource {
  id: number;
  name: string;
  docCount: number;
}

export const unitResourceStatus: UnitResource[] = [
  { id: 1, name: "1. 20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya", docCount: 30 },
  { id: 2, name: "2. Milli Mücadele", docCount: 4 },
  { id: 3, name: "3. Atatürkçülük ve Türk İnkılabı", docCount: 0 },
  { id: 4, name: "4. İki Savaş Arasındaki Dönemde Türkiye ve Dünya", docCount: 0 },
  { id: 5, name: "5. II.Dünya Savaşı Sürecinde Türkiye ve Dünya", docCount: 0 },
  { id: 6, name: "6. II.Dünya Savaşı Sonrasında Türkiye ve Dünya", docCount: 0 },
  { id: 7, name: "7. Toplumsal Devrim Çağında Dünya ve Türkiye", docCount: 0 },
  { id: 8, name: "8. 21. Yüzyılın Eşiğinde Türkiye ve Dünya", docCount: 0 },
];

export const resourceStatusMessage = "Belgeler sizin için şu an titizlikle yüklenmekte ve güncellenmektedir. Amacımız, en doğru ve güvenilir tarihi kaynakları sizlerle buluşturmaktır. Anlayışınız için teşekkür ederiz.";