import { volunteerCampaignsApi } from "../api/volunteerCampaigns";

const PAGE_SIZE_DEFAULT = 20;

// ─── Manager: Campaigns ─────────────────────────────────────────────────────

export const getVolunteerCampaigns = async ({
  page = 1,
  limit = PAGE_SIZE_DEFAULT,
  status = "",
  district = "",
} = {}) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;
    if (district) params.district = district;
    const res = await volunteerCampaignsApi.list(params);
    return {
      success: true,
      data: res?.data || [],
      pagination: res?.pagination || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể tải danh sách đợt tình nguyện",
      data: [],
      pagination: null,
    };
  }
};

export const getVolunteerCampaignById = async (id) => {
  try {
    const res = await volunteerCampaignsApi.getById(id);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không tìm thấy đợt tình nguyện" };
  }
};

export const createVolunteerCampaign = async (data) => {
  try {
    const res = await volunteerCampaignsApi.create(data);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể tạo đợt tình nguyện" };
  }
};

export const updateVolunteerCampaign = async (id, data) => {
  try {
    const res = await volunteerCampaignsApi.update(id, data);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể cập nhật đợt tình nguyện" };
  }
};

export const publishVolunteerCampaign = async (id) => {
  try {
    const res = await volunteerCampaignsApi.publish(id);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể công bố đợt tình nguyện" };
  }
};

export const startVolunteerCampaign = async (id) => {
  try {
    const res = await volunteerCampaignsApi.start(id);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể bắt đầu đợt tình nguyện" };
  }
};

export const completeVolunteerCampaign = async (id) => {
  try {
    const res = await volunteerCampaignsApi.complete(id);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể hoàn thành đợt tình nguyện" };
  }
};

export const cancelVolunteerCampaign = async (id) => {
  try {
    const res = await volunteerCampaignsApi.cancel(id);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể hủy đợt tình nguyện" };
  }
};

// ─── Manager: Approved Volunteers ──────────────────────────────────────────

export const getApprovedVolunteers = async ({
  page = 1,
  limit = 50,
  district = "",
} = {}) => {
  try {
    const params = { page, limit };
    if (district) params.district = district;
    const res = await volunteerCampaignsApi.listApprovedVolunteers(params);
    return {
      success: true,
      data: res?.data || [],
      pagination: res?.pagination || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể tải danh sách tình nguyện viên",
      data: [],
      pagination: null,
    };
  }
};

// ─── Manager: Invite ───────────────────────────────────────────────────────

export const inviteVolunteers = async (campaignId, volunteer_user_ids) => {
  try {
    const res = await volunteerCampaignsApi.invite(campaignId, volunteer_user_ids);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể gửi lời mời" };
  }
};

// ─── Manager: Stats ────────────────────────────────────────────────────────

export const getVolunteerCampaignStats = async (campaignId) => {
  try {
    const res = await volunteerCampaignsApi.getStats(campaignId);
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể tải thống kê" };
  }
};

// ─── Citizen: My Invitations ───────────────────────────────────────────────

export const getMyInvitations = async ({
  page = 1,
  limit = 20,
  status = "",
} = {}) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;
    const res = await volunteerCampaignsApi.listMyInvitations(params);
    return {
      success: true,
      data: res?.data || [],
      pagination: res?.pagination || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể tải lời mời",
      data: [],
      pagination: null,
    };
  }
};

export const respondToInvitation = async (invitationId, { status, declined_reason }) => {
  try {
    const accept = status === "accepted";
    const res = await volunteerCampaignsApi.respondToInvitation(invitationId, {
      accept,
      declined_reason,
    });
    return { success: true, data: res?.data || res };
  } catch (err) {
    return { success: false, error: err?.message || "Không thể phản hồi lời mời" };
  }
};
