/**
 * useMap.js
 * Custom hook khởi tạo và quản lý bản đồ GoongMap
 * Tài liệu: https://docs.goong.io/goong-js/docs/
 */

import { useRef, useEffect } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import {
  GOONG_MAPTILES_KEY,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from "../config/goongMap";

/**
 * @param {Array} requests - Danh sách yêu cầu cứu hộ có tọa độ
 */
const useMap = (requests = []) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    goongjs.accessToken = GOONG_MAPTILES_KEY;

    mapInstanceRef.current = new goongjs.Map({
      container: mapRef.current,
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: DEFAULT_ZOOM,
    });

    return () => {
      // Xóa tất cả markers trước khi unmount
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cập nhật markers khi danh sách requests thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Xóa markers cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Thêm markers mới
    requests.forEach((request) => {
      if (!request?.lat || !request?.lng) return;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        cursor: pointer;
        background-color: ${
          request.status === "URGENT" || request.priority === "URGENT"
            ? "#dc2626"
            : request.status === "IN_PROGRESS"
              ? "#2563eb"
              : "#16a34a"
        };
      `;

      const marker = new goongjs.Marker({ element: el })
        .setLngLat([request.lng, request.lat])
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });
  }, [requests]);

  /**
   * Di chuyển bản đồ đến vị trí yêu cầu
   * @param {object} request - Yêu cầu cứu hộ có tọa độ lat/lng
   */
  const flyToRequest = (request) => {
    if (!mapInstanceRef.current || !request?.lat || !request?.lng) return;
    mapInstanceRef.current.flyTo({
      center: [request.lng, request.lat],
      zoom: 15,
      speed: 1.2,
    });
  };

  return { mapRef, flyToRequest, mapInstance: mapInstanceRef.current };
};

export default useMap;
