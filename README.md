# Akıllı İnkılap Tarihi Asistanı

Bu proje, 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi öğretmenleri için geliştirilmiş, yapay zeka destekli bir çalışma kağıdı üreticisidir.

*(Not: Bu linki, kendi aldığın daha güzel bir ekran görüntüsünü bir resim yükleme sitesine (örn: imgur.com) yükleyip o linkle değiştirebilirsin.)*

**Canlı Prototipi Denemek İçin:** [https://ogicimnbr01.github.io/tarih-projesi-link/](https://ogicimnbr01.github.io/tarih-projesi-link/)

---

### Projenin Amacı

Bu projenin temel amacı, öğretmenlerin ders materyali hazırlama sürecini otomatikleştirmektir. Sistem, MEB müfredatındaki ünite ve kazanımlara göre, önceden kürate edilmiş birinci elden tarihi kaynakları kullanarak, öğrencilerin eleştirel düşünme ve analiz becerilerini geliştirecek, tartışma odaklı açık uçlu soruları saniyeler içinde üretir.

### Kullanılan Teknolojiler

Bu proje, modern bulut ve sunucusuz teknolojiler kullanılarak uçtan uca geliştirilmiştir.

* **Bulut Platformu:** Amazon Web Services (AWS)
* **Altyapı olarak Kod (IaC):** Terraform
* **Backend:**
    * **Mimari:** Sunucusuz (Serverless)
    * **Compute:** AWS Lambda (Python)
    * **API:** Amazon API Gateway
    * **Veritabanı:** Amazon DynamoDB (NoSQL)
* **Yapay Zeka (AI):**
    * **Soru Üretimi:** Amazon Bedrock (Claude Modeli)
    * **Belge Okuma (OCR):** AWS Textract
* **Depolama (Storage):** Amazon S3
* **Frontend:** HTML, CSS, Vanilla JavaScript
* **CI/CD & Hosting:** AWS Amplify & GitHub

### Nasıl Çalışır?

1.  **Belge Yükleme (Otomasyon):** `ÜniteID_KazanımID_BelgeAdı.pdf` formatında isimlendirilen PDF belgeleri bir S3 deposuna yüklenir.
2.  **İşleme:** S3'teki bu olay, bir Lambda fonksiyonunu tetikler. Bu fonksiyon, AWS Textract ile PDF'in metnini çıkarır ve tüm bilgileri (ID'ler, başlık, metin vb.) DynamoDB'ye kaydeder.
3.  **Kullanıcı Etkileşimi (Arayüz):** Öğretmen, web arayüzünden bir ünite ve kazan
