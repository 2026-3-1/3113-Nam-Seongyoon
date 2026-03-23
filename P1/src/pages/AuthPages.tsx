import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── 공통 인풋 컴포넌트 ──────────────────────────────────────────
function AuthInput({
  label, type = "text", placeholder, value, onChange, error,
}: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#141517] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#7A7D85] focus:outline-none transition-colors ${
          error ? "border-red-500/60 focus:border-red-500" : "border-white/[0.07] focus:border-[#4F8EF7]/60"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── 로그인 페이지 ──────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "올바른 이메일 형식이 아닙니다";
    if (!password) errs.password = "비밀번호를 입력해주세요";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // TODO: API 연동
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-white font-['Pretendard'] flex items-center justify-center px-4">
      {/* BG Glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(79,142,247,0.08) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-['Syne'] text-2xl font-extrabold bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] bg-clip-text text-transparent">
            CertificatEdu
          </Link>
          <p className="text-[#7A7D85] text-sm mt-2">자격증 합격의 최단 경로</p>
        </div>

        {/* Card */}
        <div className="bg-[#141517] border border-white/[0.07] rounded-2xl p-8">
          <h2 className="font-['Syne'] text-xl font-extrabold mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput label="이메일" type="email" placeholder="example@email.com" value={email} onChange={setEmail} error={errors.email} />
            <AuthInput label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={setPassword} error={errors.password} />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#4F8EF7]" />
                <span className="text-xs text-[#7A7D85]">로그인 유지</span>
              </label>
              <a href="#" className="text-xs text-[#4F8EF7] hover:underline">비밀번호 찾기</a>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] shadow-[0_6px_24px_rgba(79,142,247,0.3)] hover:opacity-90 transition-opacity mt-2"
            >
              로그인
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[#7A7D85] text-xs">또는</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Social Login */}
          <div className="space-y-2.5">
            {[
              { label: "카카오로 로그인", bg: "bg-[#FEE500]", text: "text-[#191919]", icon: "💬" },
              { label: "네이버로 로그인", bg: "bg-[#03C75A]", text: "text-white", icon: "N" },
            ].map(({ label, bg, text, icon }) => (
              <button key={label} className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${bg} ${text} hover:opacity-85 transition-opacity`}>
                <span className="font-bold">{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-[#7A7D85] mt-5">
          계정이 없으신가요?{" "}
          <Link to="/register" className="text-[#4F8EF7] font-semibold hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

// ── 회원가입 페이지 ────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "", role: "LEARNER" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "이름을 입력해주세요";
    if (!form.email) errs.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "올바른 이메일 형식이 아닙니다";
    if (!form.password) errs.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) errs.password = "비밀번호는 8자 이상이어야 합니다";
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = "비밀번호가 일치하지 않습니다";
    if (!agreed) errs.agree = "이용약관에 동의해주세요";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // TODO: API 연동
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-white font-['Pretendard'] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(167,139,250,0.07) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-['Syne'] text-2xl font-extrabold bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] bg-clip-text text-transparent">
            CertificatEdu
          </Link>
          <p className="text-[#7A7D85] text-sm mt-2">지금 바로 합격 여정을 시작하세요</p>
        </div>

        <div className="bg-[#141517] border border-white/[0.07] rounded-2xl p-8">
          <h2 className="font-['Syne'] text-xl font-extrabold mb-6">회원가입</h2>

          {/* Role Select */}
          <div className="flex gap-2 mb-6">
            {[{ v: "LEARNER", label: "학습자" }, { v: "INSTRUCTOR", label: "강사" }].map(({ v, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: v }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.role === v
                    ? "bg-[#4F8EF7] border-[#4F8EF7] text-white"
                    : "bg-transparent border-white/10 text-[#7A7D85] hover:border-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput label="이름" placeholder="홍길동" value={form.name} onChange={set("name")} error={errors.name} />
            <AuthInput label="이메일" type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} error={errors.email} />
            <AuthInput label="비밀번호" type="password" placeholder="8자 이상 입력" value={form.password} onChange={set("password")} error={errors.password} />
            <AuthInput label="비밀번호 확인" type="password" placeholder="비밀번호를 다시 입력" value={form.passwordConfirm} onChange={set("passwordConfirm")} error={errors.passwordConfirm} />

            {/* Agree */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#4F8EF7]" />
                <span className="text-xs text-[#7A7D85] leading-relaxed">
                  <a href="#" className="text-[#4F8EF7] hover:underline">이용약관</a> 및{" "}
                  <a href="#" className="text-[#4F8EF7] hover:underline">개인정보처리방침</a>에 동의합니다
                </span>
              </label>
              {errors.agree && <p className="text-red-400 text-xs mt-1">{errors.agree}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] shadow-[0_6px_24px_rgba(79,142,247,0.3)] hover:opacity-90 transition-opacity mt-2"
            >
              가입하기
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#7A7D85] mt-5">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-[#4F8EF7] font-semibold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
