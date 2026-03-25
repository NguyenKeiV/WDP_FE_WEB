import apiClient from "../api/client";
import { charityCampaignsApi } from "../api/charityCampaigns";

const uploadPosterImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  // Backend expects field name: "image"
  const res = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // FE apiClient interceptor returns response.data directly.
  // BE returns: { success, message, data: { url } }
  const url = res?.data?.url || res?.url;
  if (!url) throw new Error("Không thể tải ảnh poster lên server");
  return url;
};

export const createCharityCampaign = async ({
  name,
  address,
  start_at,
  end_at,
  reason,
  posterFiles = [],
}) => {
  // 1) Upload posters first
  const poster_urls = [];
  for (const file of posterFiles) {
    const url = await uploadPosterImage(file);
    poster_urls.push(url);
  }

  // 2) Create campaign — BE expects title, description, start_date, end_date, image_url
  //    (see WDP_BE charity_campaigns service + model)
  return charityCampaignsApi.createCampaign({
    title: name,
    description: reason || "",
    address: address || "",
    start_date: start_at,
    end_date: end_at,
    image_url: poster_urls[0] ?? null,
  });
};

const mapCampaignFromApi = (c) => ({
  id: c.id,
  status: c.status,
  name: c.title,
  reason: c.description,
  address: c.address,
  start_at: c.start_date,
  end_at: c.end_date,
  manager: c.creator,
  poster_urls: c.image_url
    ? [c.image_url]
    : Array.isArray(c.poster_urls)
      ? c.poster_urls
      : [],
});

export const getCharityCampaigns = async ({ page = 1, limit = 20 } = {}) => {
  const res = await charityCampaignsApi.getCampaigns({ page, limit });
  if (!res?.success) return res;
  const rows = res.campaigns ?? res.data ?? [];
  return {
    success: true,
    data: rows.map(mapCampaignFromApi),
    pagination: res.pagination,
  };
};

export const getCharityCampaignById = async (id) => {
  return charityCampaignsApi.getCampaignById(id);
};

