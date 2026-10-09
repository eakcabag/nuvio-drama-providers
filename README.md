# Nuvio Türkçe Drama Eklentileri (Providers)

Bu depo, **Nuvio** medya oynatıcı uygulaması için Tube İndirici'de kullanılan Asya ve Türkçe altyazılı drama sitelerini (**DramaDünyam** ve **DramaKolik**) entegre eden kazıyıcı (scraper/provider) eklentisidir.

---

## 📁 Proje Yapısı

```text
nuvio-drama-providers/
├── manifest.json            # Nuvio eklenti kayıt dosyası
├── providers/
│   ├── dramalar.js          # Hepsi Bir Arada (DramaDünyam + DramaKolik)
│   ├── dramadunyam.js       # Sadece DramaDünyam sağlayıcısı
│   └── dramakolik.js        # Sadece DramaKolik sağlayıcısı
├── test.js                  # Test çalıştırma dosyası
├── serve.js                 # Yerel geliştirme ve CORS destekli HTTP sunucusu
└── README.md
```

---

## 🚀 Nuvio Uygulamasına Nasıl Eklenir?

### Yöntem 1: Yerel Ağ Üzerinden (Geliştirici Modu / Plugin Tester)
1. Termux üzerinde sunucuyu başlatın:
   ```bash
   cd ~/nuvio-drama-providers
   node serve.js
   ```
2. Nuvio uygulamasını açın:
   - **Ayarlar > Eklentiler (Settings > Plugins)** veya **Geliştirici Ayarları (Developer Settings)**
   - Eklenti URL'si kısmına sunucunuzun IP adresini girin:
     ```text
     http://<TELEFONUN_YEREL_IP_ADRESI>:8080/manifest.json
     ```
   - **Ekle / Yenile (Add / Refresh)** butonuna basın.

### Yöntem 2: GitHub Üzerinden (Tüm Cihazlar İçin Kalıcı)
1. Bu klasörü kendi GitHub hesabınıza bir depo (repository) olarak push edin.
2. Nuvio uygulamasına doğrudan GitHub raw bağlantısını ekleyin:
   ```text
   https://raw.githubusercontent.com/<KULLANICI_ADINIZ>/<DEPO_ADI>/refs/heads/main/manifest.json
   ```

---

## 🧪 Test Etme

Eklentiyi terminalden doğrudan test etmek için:
```bash
node test.js
```
