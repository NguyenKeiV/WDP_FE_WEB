import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_ROUTES = {
  admin: "/admin/dashboard",
  coordinator: "/coordinator/dashboard",
  manager: "/manager/dashboard",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      const target = ROLE_ROUTES[user.role] || "/unauthorized";
      navigate(target, { replace: true });
    } catch (err) {
      if (
        err.message?.toLowerCase().includes("disabled") ||
        err.message?.toLowerCase().includes("kích hoạt")
      ) {
        setError(
          "Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.",
        );
      } else {
        setError(
          err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ===== LEFT SIDE - HERO ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDA1viCHF16Z5-gQlEoL9lpNM3BJGpuUgpsWZAO6O5VAGefHgVmFAH9i3uRswJXRLeJDBOvKQXYROQsiOahZev_MZWkOalcIv_5DJNQM2rxkjX0UOcR3CYcpM6UdXU5N9F62CmLp0pAPWP8RhR3LUs6WiwwvBaqC0q82b2DXqs23XT7XcCjhrkQNoObvavvLFl2OlYSd2E4CJ4mpy01XZyOxEMI87En8iAVn3Iz4X4rJLXKWSPlvEL-J5XAMC7QuXEWIoaSGjzdFlQ')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a4b85]/90 via-[#0a4b85]/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              Hệ thống Cứu hộ Quốc gia
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Kết nối nguồn lực.
              <br />
              Chia sẻ yêu thương.
            </h1>

            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Hệ thống quản lý thông tin cứu trợ tập trung, minh bạch và kịp
              thời cho người dân Việt Nam.
            </p>

            <div className="mt-8 flex gap-4">
              <div className="flex -space-x-3">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZcfw40vHmhX4yMFA7tKMtpw_Q6o0xJo56DcQxZndt_E-2Ve65MPKMi58NAtwM0nRbF2KyNSIKdk6GZdk1cQKxjwcNEJ6giViTGrH5zVefUgr1RIBRFytxUlS1Qfg0V0U7cIr19XcU5Nr7LwV9Y1nU7rN2eWac0JdHTJdEcB06xxkAFKkxcFgMbgtcZgq3uBv6fQQVhhJFj6M0cbw7pnqLhSLeVe9T56wed14sv1iNvmX7gdl9Peseehr_mqgQcI7LkFYgoWbszoI",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxzVCj4oYJS-ynv8zyXYGl1tNcPok76QUgKj3953vV8W6IVV0hqA9BV0fnlrbPZjwZ9A8XmO1WLkHe-Weu9S2NkX3KnToIEQCdR8_FjIutHQvtfMnDAZFT7OiP9ehVzwfxg_CF9dWiFfEDCetckwcjQXWxd6GEpIcCo6u9jyV19OQl4o6CZNkFgn7Zgp8_ec5UMES5plFGxzZNwgW9Mz0x7ha_iHnGG36k6UntsYc5entEY7i04XmrCGpL812KAnBEwz2VKqQtpi8",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDBjKWm9llZtsifQvla7rAaApE_SMx1bACp8LKPzdm5KmlkguS1YUmzwJpQD-UjRAJakDMODnOICiaHkXOB25QnVDmekUBc5muLAnqGj3RVXDfHlJ-lIqvhjZv58SS6PkMVEeIWd_ga5DJqTDU5RLc78GVOcH-95zF4MvRVz2Beba0YPlGuY4HSt0nI5qRZbU2LbvAMTyiME7iMTRU2osRensemMWnGkYjO_29coptxm3iz9N-E_fpxB71Bvt-hBTHMbK37cqJNlQw",
                ].map((src, i) => (
                  <img
                    key={i}
                    alt="Tình nguyện viên"
                    className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
                    src={src}
                  />
                ))}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/50 bg-[#0a4b85]/80 text-white text-xs font-bold backdrop-blur">
                  +2K
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-white font-bold text-sm">
                  Tình nguyện viên
                </span>
                <span className="text-white/60 text-xs">
                  Đang hoạt động trên cả nước
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE - FORM ===== */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 h-screen overflow-y-auto">
        {/* Header */}
        <header className="w-full px-6 py-5 flex items-center justify-between bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#063660] text-white rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-[#0F172A] text-lg font-extrabold tracking-tight uppercase hidden sm:block">
              CỨU HỘ VIỆT NAM
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-400">
            <span className="material-symbols-outlined text-sm text-gray-500">
              language
            </span>
            <span className="text-gray-700 ml-1">VN</span>
            <span className="mx-1 text-gray-300">|</span>
            <span>EN</span>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[440px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Title */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Đăng nhập
                  </h2>
                  <p className="text-sm text-gray-500">
                    Vui lòng nhập thông tin để truy cập hệ thống điều phối.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#063660] text-[20px]">
                          mail
                        </span>
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#063660]/20 focus:border-[#063660] bg-white transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                      Mật khẩu
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#063660] text-[20px]">
                          lock
                        </span>
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#063660]/20 focus:border-[#063660] bg-white transition-all text-sm font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 accent-[#063660] cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm font-bold text-[#063660] hover:text-[#052949] hover:underline"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">
                        error
                      </span>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-[#063660] hover:bg-[#052949] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-[#063660]/30 active:scale-[0.98] transition-all duration-200 gap-2 group"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">
                          refresh
                        </span>
                        <span>ĐANG ĐĂNG NHẬP...</span>
                      </>
                    ) : (
                      <>
                        <span>ĐĂNG NHẬP</span>
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-4 flex justify-center gap-6 opacity-50 hover:opacity-80 transition-opacity duration-300">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <span className="material-symbols-outlined text-base">
                  security
                </span>
                Bảo mật SSL
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <span className="material-symbols-outlined text-base">
                  gavel
                </span>
                Pháp lý rõ ràng
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <span className="material-symbols-outlined text-base">
                  shield
                </span>
                Dữ liệu được mã hóa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
