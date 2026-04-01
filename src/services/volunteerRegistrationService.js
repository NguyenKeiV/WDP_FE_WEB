import { volunteerRegistrationsApi } from "../api/volunteerRegistrations";

const PAGE_SIZE_DEFAULT = 20;

export const getVolunteerRegistrations = async ({
  page = 1,
  limit = PAGE_SIZE_DEFAULT,
  status = "",
  district = "",
} = {}) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;
    if (district) params.district = district;

    const res = await volunteerRegistrationsApi.getAll(params);
    return {
      success: true,
      data: res?.data || [],
      pagination: res?.pagination || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể tải danh sách đăng ký tình nguyện",
      data: [],
      pagination: null,
    };
  }
};

export const reviewVolunteerRegistration = async ({
  id,
  status,
  coordinator_note = "",
}) => {
  try {
    const res = await volunteerRegistrationsApi.review(id, {
      status,
      coordinator_note,
    });
    return {
      success: true,
      data: res?.data || null,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể cập nhật trạng thái đăng ký",
    };
  }
};
