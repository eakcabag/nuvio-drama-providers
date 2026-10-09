/**
 * DramaDünyam Provider for Nuvio
 * Fetches Asian and Turkish mini-dramas from dramadunyam.com
 */

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const BASE_URL = "https://dramadunyam.com";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function cleanStr(str) {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[üÜ]/g, "u")
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function getDramaDunyamHeaders() {
  const headers = {
    "User-Agent": USER_AGENT,
    "Referer": BASE_URL + "/",
    "Accept": "application/json, text/plain, */*"
  };

  return fetch(BASE_URL + "/api/config", { headers })
    .then(res => {
      const cookie = res.headers.get("set-cookie");
      if (cookie) headers["Cookie"] = cookie;
      return headers;
    })
    .catch(() => headers);
}

function searchItems(query, headers) {
  if (!query) return Promise.resolve([]);
  const url = BASE_URL + "/api/search?q=" + encodeURIComponent(query);
  return fetch(url, { headers })
    .then(res => res.json())
    .then(json => (json && json.data) ? json.data : [])
    .catch(() => []);
}

function getStreams(tmdbId, mediaType, season, episode) {
  const ep = episode || 1;
  console.log("[DramaDünyam] Fetching streams for TMDB ID: " + tmdbId + " Ep: " + ep);

  return getTmdbTitles(tmdbId, mediaType)
    .then(titles => {
      if (titles.length === 0) return [];
      
      return getDramaDunyamHeaders().then(headers => {
        // Try searching with primary titles
        const searchPromises = titles.slice(0, 3).map(title => searchItems(title, headers));
        
        return Promise.all(searchPromises).then(resultsArrays => {
          const allFound = [];
          const seenIds = new Set();
          
          resultsArrays.forEach(arr => {
            arr.forEach(item => {
              if (item && item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                allFound.push(item);
              }
            });
          });

          if (allFound.length === 0) {
            console.log("[DramaDünyam] No items found for titles:", titles);
            return [];
          }

          // Pick top matching items (up to 3)
          const targetItems = allFound.slice(0, 3);
          const streamPromises = targetItems.map(item => {
            const playUrl = BASE_URL + "/play/" + item.id + "/" + ep;
            return fetch(playUrl, { headers })
              .then(res => res.json())
              .then(playData => {
                let streamUrl = playData.url;
                if (!streamUrl) {
                  streamUrl = BASE_URL + "/hls/" + item.id + "/" + ep + "/playlist.m3u8";
                } else if (streamUrl.startsWith("/")) {
                  streamUrl = BASE_URL + streamUrl;
                }

                const subtitles = (playData.altyazilar || []).map(s => ({
                  url: s.src,
                  lang: (s.dil || "tr").toLowerCase(),
                  label: s.dil === "TR" ? "Türkçe" : (s.dil || "Altyazı")
                }));

                return {
                  name: "DramaDünyam",
                  title: (item.title || "Dizi") + " - Bölüm " + ep + " [1080p HLS]",
                  url: streamUrl,
                  quality: "1080p",
                  headers: {
                    "User-Agent": USER_AGENT,
                    "Referer": BASE_URL + "/",
                    ...(headers["Cookie"] ? { "Cookie": headers["Cookie"] } : {})
                  },
                  subtitles: subtitles
                };
              })
              .catch(err => {
                console.error("[DramaDünyam] Play endpoint failed:", err.message);
                // Return fallback HLS URL
                return {
                  name: "DramaDünyam (HLS)",
                  title: (item.title || "Dizi") + " - Bölüm " + ep,
                  url: BASE_URL + "/hls/" + item.id + "/" + ep + "/playlist.m3u8",
                  quality: "720p",
                  headers: {
                    "User-Agent": USER_AGENT,
                    "Referer": BASE_URL + "/"
                  },
                  subtitles: []
                };
              });
          });

          return Promise.all(streamPromises);
        });
      });
    })
    .catch(err => {
      console.error("[DramaDünyam] Provider error:", err.message);
      return [];
    });
}

module.exports = { getStreams };
