# Tarih Asistanı 📜

[![Website](https://img.shields.io/badge/Website-tarihasistani.com.tr-d4a84b?style=flat-square)](https://www.tarihasistani.com.tr)
[![AWS](https://img.shields.io/badge/AWS-Serverless-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?style=flat-square&logo=terraform)](https://www.terraform.io/)

12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi öğretmenleri için **yapay zeka destekli çalışma kağıdı üreticisi**.

---

## 🎯 Projenin Amacı

Öğretmenlerin ders materyali hazırlama sürecini otomatikleştirmek. Sistem:

- **MEB müfredatına uygun** ünite ve kazanımları kullanır
- **Birinci elden tarihi belgeleri** (gazete, mektup, hatırat) analiz eder
- **Bloom Taksonomisine göre** sorular üretir
- **Saniyeler içinde** çalışma kağıdı oluşturur

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
│  React + TypeScript + Vite + TailwindCSS                            │
│  AWS Amplify (CI/CD & Hosting)                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (HTTP)                              │
│  /api → Lambda (Soru Üretme)                                        │
│  /admin → Lambda (Belge Yönetimi)                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Lambda     │  │   Lambda     │  │   Lambda     │
│  Soru Üret   │  │   Admin      │  │  Polling     │
│  (Bedrock)   │  │  (S3/Textract)│  │  (2 dakika)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        AWS SERVİSLERİ                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  DynamoDB   │  │     S3      │  │  CloudFront │  │  Textract  │  │
│  │ (Kaynaklar) │  │  (Belgeler) │  │   (CDN)     │  │   (OCR)    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │
│                                                                      │
│  ┌─────────────┐                                                     │
│  │  Bedrock    │  Claude 4.5 Sonnet (AI Soru Üretimi)               │
│  └─────────────┘                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Backend** | AWS Lambda (Python 3.12), Serverless |
| **API** | Amazon API Gateway (HTTP) |
| **Veritabanı** | Amazon DynamoDB (NoSQL) |
| **Depolama** | Amazon S3 + CloudFront (CDN) |
| **AI/ML** | Amazon Bedrock (Claude 3.5 Sonnet) |
| **OCR** | AWS Textract |
| **IaC** | Terraform |
| **CI/CD** | AWS Amplify + GitHub |

---

## 📁 Proje Yapısı

```
Tarih-Asistani/
├── src/                    # React frontend kaynak kodu
│   ├── components/         # React bileşenleri
│   └── utils/              # Yardımcı fonksiyonlar
├── lambda_function/        # Ana Lambda (soru üretimi)
│   └── lambda_function.py
├── admin_lambda/           # Admin Lambda (belge yönetimi)
│   └── admin_handler.py
├── polling_lambda/         # Polling Lambda (Textract takibi)
│   └── polling_handler.py
├── public/                 # Statik dosyalar
├── main.tf                 # Terraform altyapı tanımları
├── variables.tf            # Terraform değişken tanımları
├── admin.html              # Belge yükleme paneli
└── index.html              # Frontend entry point
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.12
- Terraform 1.0+
- AWS CLI (yapılandırılmış)

### 1. Depoyu Klonlayın

```bash
git clone git@github.com:ogicimnbr01/Tarih-Asistani.git
cd Tarih-Asistani
```

### 2. Frontend Bağımlılıklarını Yükleyin

```bash
npm install
```

### 3. Terraform Değişkenlerini Ayarlayın

```bash
# terraform.tfvars dosyası oluşturun (Git'e eklenmez)
echo 'admin_api_key = "GucluBirSifre123!"' > terraform.tfvars
```

### 4. AWS Altyapısını Oluşturun

```bash
terraform init
terraform apply
```

### 5. Frontend'i Çalıştırın

```bash
npm run dev
```

---

## 📖 Nasıl Çalışır?

### Belge Yükleme Akışı

1. **Admin Paneli** (`/admin.html`) üzerinden şifre ile giriş yapılır
2. Ünite ve kazanım seçilir
3. Tarihsel belge (PDF/JPG) yüklenir
4. Sistem otomatik olarak:
   - Dosyayı S3'e yükler
   - Textract ile OCR işlemi başlatır
   - Polling Lambda 2 dakikada bir kontrol eder
   - İşlem tamamlandığında DynamoDB'ye kaydeder

### Soru Üretme Akışı

1. Öğretmen web sitesinden ünite/kazanım seçer
2. Mevcut kaynaklar listelenir
3. Kaynak seçilip "Çalışma Kağıdı Oluştur" tıklanır
4. Lambda, Bedrock'a istek gönderir
5. Claude modeli Bloom Taksonomisine göre 3 soru üretir

---

## 🔐 Güvenlik

- ✅ Repository **private**
- ✅ Tüm hassas veriler Git history'den temizlendi
- ✅ API anahtarları `terraform.tfvars` dosyasında (Git dışı)
- ✅ Admin paneli şifre korumalı
- ✅ CORS yapılandırması aktif

---

## 🌐 Canlı Demo

**https://www.tarihasistani.com.tr**

---

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

<p align="center">
  <sub>MEB 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi için geliştirilmiştir.</sub>
</p>
