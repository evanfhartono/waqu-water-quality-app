export const WATER_SOURCES = [
  { latitude: -6.2013867, longitude: 106.7819894, name: 'Binus Development Purpose', radius: 800 },
  { latitude: -6.197983, longitude: 106.671800, name: 'Danau Cipondoh', radius: 800 },
  { latitude: -6.167802,  longitude: 106.780510, name: 'Waduk Tomang', radius: 800 },
  { latitude: -6.125625,  longitude: 106.867897, name: 'Waduk Sunter Utara', radius: 550 },
  { latitude: -6.145720,  longitude: 106.881448, name: 'Danau Sunter', radius: 560 },
  { latitude: -6.147768,  longitude: 106.867437, name: 'Waduk Sunter Barat', radius: 800 },
  { latitude: -6.204380,  longitude: 106.826352, name: 'Waduk Setia Budi Barat', radius: 150 },
  { latitude: -6.204380,  longitude: 106.826352, name: 'Waduk Setia Budi Barat', radius: 150 },
  { latitude: -6.204955,  longitude: 106.829190, name: 'Waduk Setia Budi Timur', radius: 150 },
];

// export interface WaterSource {
//   type: 'lake' | 'river';
//   name: string;
//   boundary?: { latitude: number; longitude: number }[]; // Lake polygon
//   path?: { latitude: number; longitude: number }[]; // River polyline
//   radius?: number; // Lake proximity (meters)
//   buffer?: number; // River buffer (meters)
//   source: string; // Data source (e.g., OpenStreetMap)
// }

// // Fallback water sources
// export const FALLBACK_WATER_SOURCES: WaterSource[] = [
//   {
//     type: 'lake',
//     name: 'Danau Cipondoh',
//     boundary: [
//       { latitude: -6.197983, longitude: 106.671800 },
//       { latitude: -6.197500, longitude: 106.672300 },
//       { latitude: -6.198500, longitude: 106.672300 },
//       { latitude: -6.198000, longitude: 106.671800 },
//     ],
//     radius: 800,
//     source: 'OpenStreetMap',
//   },
//   {
//     type: 'river',
//     name: 'Kali Angke',
//     path: [
//       { latitude: -6.200000, longitude: 106.780000 },
//       { latitude: -6.201000, longitude: 106.781000 },
//       { latitude: -6.202000, longitude: 106.782000 },
//     ],
//     buffer: 50,
//     source: 'OpenStreetMap',
//   },
// ];

// // Mock water quality data
// export const MOCK_WATER_QUALITY: Record<string, { pH: number; pollution: string; source: string }> = {
//   'Danau Cipondoh': { pH: 7.2, pollution: 'low', source: 'Sample Water Quality Database' },
//   'Kali Angke': { pH: 6.8, pollution: 'moderate', source: 'Sample Water Quality Database' },
//   'Unnamed Lake': { pH: 7.0, pollution: 'low', source: 'Sample Water Quality Database' },
//   'Unnamed River': { pH: 6.9, pollution: 'low', source: 'Sample Water Quality Database' },
// };

// // Fetch water sources from OSM
// export const fetchWaterSources = async (lat: number, lon: number): Promise<WaterSource[]> => {
//   try {
//     const query = `
//       [out:json];
//       (
//         way["natural"="water"]["water"="lake"](around:5000,${lat},${lon});
//         way["waterway"="river"](around:5000,${lat},${lon});
//       );
//       out geom;
//     `;
//     const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
//     const data = await response.json();

//     const sources: WaterSource[] = data.elements.map((el: any) => {
//       const coords = el.geometry.map((g: any) => ({ latitude: g.lat, longitude: g.lon }));
//       return {
//         type: el.tags.waterway === 'river' ? 'river' : 'lake',
//         name: el.tags.name || (el.tags.waterway === 'river' ? 'Unnamed River' : 'Unnamed Lake'),
//         [el.tags.waterway === 'river' ? 'path' : 'boundary']: coords,
//         [el.tags.waterway === 'river' ? 'buffer' : 'radius']: 50,
//         source: 'OpenStreetMap',
//       };
//     });

//     console.log('Fetched water sources:', sources);
//     return sources.length > 0 ? sources : FALLBACK_WATER_SOURCES;
//   } catch (error) {
//     console.error('Error fetching OSM data:', error);
//     return FALLBACK_WATER_SOURCES;
//   }
// };

// // Fetch water quality (mock)
// export const fetchWaterQuality = async (sourceName: string) => {
//   try {
//     const quality = MOCK_WATER_QUALITY[sourceName] || MOCK_WATER_QUALITY['Unnamed Lake'];
//     console.log(`Quality for ${sourceName}:`, quality);
//     return quality;
//   } catch (error) {
//     console.error('Error fetching quality data:', error);
//     return { pH: 7.0, pollution: 'low', source: 'Sample Water Quality Database' };
//   }
// };