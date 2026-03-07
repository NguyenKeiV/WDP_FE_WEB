/**
 * authService.js
 * Dịch vụ xác thực - đọc trạng thái đăng nhập từ localStorage
 */

const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "auth_token";
const AUTH_USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || "auth_user";

const authService = {
  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: () => {
    const user = localStorage.getItem(AUTH_USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Lấy token xác thực
   */
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Đăng xuất - xóa dữ liệu xác thực khỏi localStorage
   */
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

export default authService;
