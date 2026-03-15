// =============================================
// Goong Maps Configuration
// =============================================

export const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;
export const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
export const GOONG_API_URL =
  import.meta.env.VITE_GOONG_API_URL || "https://rsapi.goong.io";
export const GOONG_TILES_URL =
  import.meta.env.VITE_GOONG_TILES_URL ||
  "https://tiles.goong.io/assets/goong_map_web.json";

// Default map center (TP.HCM) and zoom level
export const DEFAULT_CENTER = {
  lat: 10.762622,
  lng: 106.660172,
};

export const DEFAULT_ZOOM = 12;

// =============================================
// Goong REST API helpers
// =============================================

/**
 * Geocoding: tìm kiếm địa điểm theo từ khóa
 * @param {string} input - từ khóa tìm kiếm
 * @returns {Promise<object>} danh sách gợi ý địa điểm
 */
export async function searchPlaces(input) {
  const url = `${GOONG_API_URL}/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${GOONG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Goong AutoComplete request failed");
  return res.json();
}

/**
 * Lấy chi tiết địa điểm theo place_id
 * @param {string} placeId
 * @returns {Promise<object>}
 */
export async function getPlaceDetail(placeId) {
  const url = `${GOONG_API_URL}/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Goong Place Detail request failed");
  return res.json();
}

/**
 * Reverse geocoding: lấy địa chỉ từ tọa độ lat/lng
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object>}
 */
export async function reverseGeocode(lat, lng) {
  const url = `${GOONG_API_URL}/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Goong Geocode request failed");
  return res.json();
}

/**
 * Tính đường đi giữa hai điểm
 * @param {{ lat: number, lng: number }} origin - điểm xuất phát
 * @param {{ lat: number, lng: number }} destination - điểm đến
 * @param {"bike"|"car"|"taxi"|"truck"} vehicle - loại phương tiện
 * @returns {Promise<object>}
 */
export async function getDirections(origin, destination, vehicle = "car") {
  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${destination.lat},${destination.lng}`;
  const url = `${GOONG_API_URL}/Direction?origin=${originStr}&destination=${destinationStr}&vehicle=${vehicle}&api_key=${GOONG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Goong Direction request failed");
  return res.json();
}

/**
 * Tính khoảng cách và thời gian di chuyển (Distance Matrix)
 * @param {string} origins - "lat,lng|lat,lng"
 * @param {string} destinations - "lat,lng|lat,lng"
 * @param {"bike"|"car"|"taxi"|"truck"} vehicle
 * @returns {Promise<object>}
 */
export async function getDistanceMatrix(
  origins,
  destinations,
  vehicle = "car",
) {
  const url = `${GOONG_API_URL}/DistanceMatrix?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&vehicle=${vehicle}&api_key=${GOONG_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Goong Distance Matrix request failed");
  return res.json();
}
