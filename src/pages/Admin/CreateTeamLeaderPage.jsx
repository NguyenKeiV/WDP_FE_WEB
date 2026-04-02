import React, { useState, useCallback } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { PersonAdd, Email, Close, ChevronRight, ArrowBack } from "@mui/icons-material";
import { createTeamLeaderAccount } from "../../services/userService";
import { useNavigate } from "react-router-dom";

function SuccessView({ email, onClose }) {
  return (
    <div className="p-8 text-center space-y-5">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce-once">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tài khoản đã được tạo!</h2>
        <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
          Email chứa thông tin đăng nhập đã được gửi đến <br />
          <strong className="text-gray-900">{email}</strong>
        </p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 text-left max-w-sm mx-auto">
        <p className="font-semibold mb-1">Thông tin đăng nhập đã được gửi email:</p>
        <ul className="list-disc list-inside space-y-1 text-green-700">
          <li>Họ và tên</li>
          <li>Mật khẩu tạm thời (tự động tạo)</li>
        </ul>
        <p className="mt-2 text-green-600 font-medium">
          Trưởng nhóm nên đăng nhập và đổi mật khẩu ngay.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-4 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:scale-105"
      >
        Tạo thêm tài khoản
      </button>
    </div>
  );
}

export default function CreateTeamLeaderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");

  const showToast = useCallback((msg) => {
    const el = document.createElement("div");
    el.className = "fixed top-6 right-6 z-[60] px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white bg-emerald-500 animate-slide-in";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }, []);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await createTeamLeaderAccount({ email: form.email, username: form.username });
      if (result.success) {
        setCreatedEmail(form.email);
        setDone(true);
        showToast("Tài khoản trưởng nhóm đã được tạo và gửi email!");
      } else {
        setError(result.error || "Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({ email: "", username: "" });
    setError("");
    setDone(false);
    setCreatedEmail("");
  };

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500/50 z-10"></div>

        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0 z-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-1 hover:text-purple-600 transition-colors"
              >
                <ArrowBack sx={{ fontSize: 16 }} />
                <span>Quản lý người dùng</span>
              </button>
              <ChevronRight sx={{ fontSize: 12 }} />
              <span className="text-gray-900 font-medium">Tạo tài khoản Trưởng nhóm</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
                <PersonAdd sx={{ fontSize: 28 }} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Tạo tài khoản Trưởng nhóm
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Tạo tài khoản cho trưởng nhóm tình nguyện viên. Hệ thống sẽ tự động tạo mật khẩu và gửi email thông tin đăng nhập.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-8">
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {done ? (
                <SuccessView email={createdEmail} onClose={handleReset} />
              ) : (
                <>
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-5">
                    <div className="flex items-center gap-3 text-white">
                      <Email sx={{ fontSize: 22 }} />
                      <div>
                        <h2 className="font-bold text-lg">Thông tin tài khoản</h2>
                        <p className="text-white/70 text-xs">Email thông tin đăng nhập sẽ được gửi tự động</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email trưởng nhóm <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Email sx={{ fontSize: 18, color: "#9ca3af" }} />
                        </div>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                          placeholder="truongnhom@example.com"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">
                        Email sẽ nhận thông tin đăng nhập gồm họ và tên và mật khẩu tạm thời.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        required
                        value={form.username}
                        onChange={set("username")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                      <p className="mt-1.5 text-xs text-gray-500">
                        Họ và tên phải là duy nhất trong hệ thống.
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {error}
                      </div>
                    )}

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
                      <p className="font-semibold mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                        </svg>
                        Bảo mật
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-indigo-700">
                        <li>Mật khẩu sẽ được tạo tự động (12 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt).</li>
                        <li>Mật khẩu sẽ được gửi qua email một lần duy nhất.</li>
                        <li>Trưởng nhóm nên đổi mật khẩu ngay sau khi đăng nhập.</li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50 hover:scale-[1.02]"
                      >
                        <PersonAdd sx={{ fontSize: 20 }} />
                        {saving ? "Đang xử lý..." : "Tạo tài khoản & gửi email"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
