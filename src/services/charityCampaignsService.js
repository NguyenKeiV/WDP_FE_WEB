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

  // 2) Create campaign
  return charityCampaignsApi.createCampaign({
    name,
    address,
    start_at,
    end_at,
    reason,
    poster_urls,
  });
};

export const getCharityCampaigns = async ({ page = 1, limit = 20 } = {}) => {
  return charityCampaignsApi.getCampaigns({ page, limit });
};

export const getCharityCampaignById = async (id) => {
  return charityCampaignsApi.getCampaignById(id);
};

