/**
 * Test Runner for Nuvio Drama Providers
 */

const unified = require("./providers/dramalar.js");
const dramadunyam = require("./providers/dramadunyam.js");

console.log("=== NUVIO DRAMA PROVIDERS TESTİ BAŞLIYOR ===");

// Test Squid Game (TMDB: 93405) Sezon 1 Bölüm 1
console.log("\n[Test 1] DramaDünyam Test Ediliyor (TMDB: 93405 - Squid Game)...");
dramadunyam.getStreams("93405", "tv", 1, 1)
  .then(streams => {
    console.log("DramaDünyam Sonuç:", streams.length, "akış bulundu.");
    if (streams.length > 0) {
      console.log("İlk Akış Başlığı:", streams[0].title);
      console.log("İlk Akış URL:", streams[0].url);
      console.log("Altyazı Sayısı:", (streams[0].subtitles || []).length);
    }

    console.log("\n[Test 2] Hepsi Bir Arada (Unified) Test Ediliyor...");
    return unified.getStreams("93405", "tv", 1, 1);
  })
  .then(combined => {
    console.log("Toplam Birleştirilmiş Akış Sayısı:", combined.length);
    console.log("\n✅ Testler Başarıyla Tamamlandı!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Test Hatası:", err);
    process.exit(1);
  });
