# Nuvio Türkçe Drama Eklentileri (Providers)

Bu depo, **Nuvio** medya oynatıcı uygulaması için Asya ve Türkçe altyazılı drama sitelerini (**DramaDünyam** ve **DramaKolik**) entegre eden resmi kazıyıcı (scraper/provider) eklenti deposudur.

---

## ⚡ Nuvio Uygulamasına Nasıl Eklenir? (Kolay Kurulum)

1. **Nuvio** uygulamasını açın.
2. **Ayarlar > Eklentiler (Settings > Plugins)** menüsüne gidin.
3. **Depo Ekle (Add Repository)** alanına aşağıdaki bağlantıyı yapıştırın:

```text
https://raw.githubusercontent.com/eakcabag/nuvio-drama-providers/refs/heads/main/manifest.json
```

4. **Ekle / Yenile (Install / Refresh)** butonuna basın.
5. Listeden dilediğiniz sağlayıcıyı (*Türkçe Dramalar Hepsi Bir Arada*, *DramaDünyam* veya *DramaKolik*) aktif edin.

---

## 📁 Eklenti ve Dosya Yapısı

```text
nuvio-drama-providers/
├── manifest.json            # Nuvio eklenti kayıt dosyası
├── providers/
│   ├── dramalar.js          # Hepsi Bir Arada (DramaDünyam + DramaKolik)
│   ├── dramadunyam.js       # Sadece DramaDünyam sağlayıcısı (HLS & Türkçe Altyazı)
│   └── dramakolik.js        # Sadece DramaKolik sağlayıcısı
├── test.js                  # Terminal test aracı
├── serve.js                 # Yerel geliştirme ve CORS destekli HTTP sunucusu
└── README.md
```

---

## 🧪 Yerel Test Etme (Opsiyonel)

Terminal üzerinden akışları doğrulamak için:
```bash
node test.js
```

Yerel HTTP sunucusu üzerinden çalıştırmak için:
```bash
node serve.js
```
Yerel bağlantı: `http://localhost:8080/manifest.json`
