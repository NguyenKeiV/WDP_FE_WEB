import { charityApi } from "../api/charity";

export const getCharityHistoryByPhone = async ({
  donorPhone,
  page = 1,
  limit = 20,
} = {}) => {
  try {
    const res = await charityApi.getHistoryByPhone({
      donor_phone: donorPhone,
      page,
      limit,
    });

    // BE trả về: { success, message, data: histories, pagination }
    const histories = res?.data || [];
    const pagination = res?.pagination;

    return {
      success: true,
      histories,
      pagination,
    };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Không thể tải lịch sử quyên góp",
      histories: [],
      pagination: null,
    };
  }
};
