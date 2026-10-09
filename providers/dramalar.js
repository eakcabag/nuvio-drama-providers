/**
 * Unified Turkish Drama Provider for Nuvio
 * Combines DramaDünyam and DramaKolik into a single aggregator provider.
 */

const dramadunyam = require("./dramadunyam.js");
const dramakolik = require("./dramakolik.js");

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Dramalar Unified] Aggregating streams for TMDB: " + tmdbId + " Ep: " + episode);

  const p1 = dramadunyam.getStreams(tmdbId, mediaType, season, episode).catch(() => []);
  const p2 = dramakolik.getStreams(tmdbId, mediaType, season, episode).catch(() => []);

  return Promise.all([p1, p2]).then(results => {
    const combined = [];
    results.forEach(list => {
      if (Array.isArray(list)) {
        combined.push(...list);
      }
    });
    console.log("[Dramalar Unified] Found total streams:", combined.length);
    return combined;
  });
}

module.exports = { getStreams };
