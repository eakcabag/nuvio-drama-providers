/**
 * DramaKolik Provider for Nuvio
 * Fetches Asian dramas from dramakolik.co
 */

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const BASE_URL = "https://dramakolik.co";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getTmdbTitles(tmdbId, mediaType) {
  const type = mediaType === "movie" ? "movie" : "tv";
  const url = "https://api.themoviedb.org/3/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&language=tr-TR&append_to_response=translations";

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const titles = [];
      if (data.name) titles.push(data.name);
      if (data.title) titles.push(data.title);
      if (data.original_name) titles.push(data.original_name);
      if (data.original_title) titles.push(data.original_title);

      if (data.translations && data.translations.translations) {
        data.translations.translations.forEach(tr => {
          const tName = tr.data && (tr.data.name || tr.data.title);
          if (tName && !titles.includes(tName)) titles.push(tName);
        });
      }
      return titles.filter(Boolean);
    })
    .catch(() => []);
}

function decodeStreamUrl(rawUrl) {
  if (!rawUrl) return "";
  let full = rawUrl.startsWith("/") ? BASE_URL + rawUrl : rawUrl;
  if (full.includes("live.php") && full.includes("url=")) {
    try {
      const parts = full.split("url=");
      if (parts[1]) {
        const b64 = decodeURIComponent(parts[1].split("&")[0]);
        // atob equivalent
        const decoded = Buffer.from ? Buffer.from(b64, 'base64').toString('utf-8') : b64;
        if (decoded.startsWith("http")) return decoded;
      }
    } catch (e) {}
  }
  return full;
}

function searchDramas(query) {
  const url = BASE_URL + "/katalog?q=" + encodeURIComponent(query);
  const headers = { "User-Agent": USER_AGENT, "Referer": BASE_URL + "/" };

  return fetch(url, { headers })
    .then(res => res.text())
    .then(html => {
      const results = [];
      const regex = /<a[^>]+href=["']\/dizi\/([^"']+)["'][^>]*>(.*?)<\/a>/gs;
      let match;
      while ((match = regex.exec(html)) !== null) {
        const slug = match[1].split("/")[0].trim();
        const inner = match[2];
        const altMatch = inner.match(/alt=["']([^"']+)["']/i);
        const title = altMatch ? altMatch[1].trim() : slug.replace(/-/g, " ");
        if (slug && !results.some(r => r.slug === slug)) {
          results.push({ slug, title });
        }
      }
      return results;
    })
    .catch(() => []);
}

function getStreams(tmdbId, mediaType, season, episode) {
  const ep = episode || 1;
  console.log("[DramaKolik] Fetching streams for TMDB ID: " + tmdbId + " Ep: " + ep);

  return getTmdbTitles(tmdbId, mediaType)
    .then(titles => {
      if (titles.length === 0) return [];

      const searchPromises = titles.slice(0, 3).map(t => searchDramas(t));
      return Promise.all(searchPromises).then(resultsArrays => {
        const allItems = [];
        const seen = new Set();
        resultsArrays.forEach(arr => {
          arr.forEach(it => {
            if (!seen.has(it.slug)) {
              seen.add(it.slug);
              allItems.push(it);
            }
          });
        });

        if (allItems.length === 0) {
          console.log("[DramaKolik] No matches found for titles:", titles);
          return [];
        }

        const targetItems = allItems.slice(0, 3);
        const streamPromises = targetItems.map(item => {
          const apiUrl = BASE_URL + "/api/video?slug=" + encodeURIComponent(item.slug) + "&ep=" + ep;
          const headers = {
            "User-Agent": USER_AGENT,
            "Referer": BASE_URL + "/dizi/" + item.slug + "/bolum-" + ep,
            "Accept": "application/json"
          };

          return fetch(apiUrl, { headers })
            .then(res => res.json())
            .then(data => {
              const rawUrl = data.url || data.video_url || "";
              const streamUrl = decodeStreamUrl(rawUrl);
              if (!streamUrl) return null;

              return {
                name: "DramaKolik",
                title: item.title + " - Bölüm " + ep + " (Türkçe)",
                url: streamUrl,
                quality: "1080p",
                headers: {
                  "User-Agent": USER_AGENT,
                  "Referer": BASE_URL + "/"
                },
                subtitles: []
              };
            })
            .catch(() => null);
        });

        return Promise.all(streamPromises).then(resList => resList.filter(Boolean));
      });
    })
    .catch(err => {
      console.error("[DramaKolik] Error:", err.message);
      return [];
    });
}

module.exports = { getStreams };
