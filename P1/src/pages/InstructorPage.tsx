import { useState } from "react";
import { Link } from "react-router-dom";

const STEPS = [
  { num: "01", title: "신청서 제출", desc: "경력 사항과 수강생 합격 실적을 작성하여 제출합니다." },
  { num: "02", title: "서류 심사", desc: "관리자가 증빙 서류를 검토합니다. 영업일 기준 3~5일 소요." },
  { num: "03", title: "인증 완료", desc: "승인 시 인증 강사 뱃지가 부여되고 강의를 등록할 수 있습니다." },
];

const BENEFITS = [
  { icon: "🏅", title: "인증 뱃지", desc: "프로필과 강의에 인증 강사 뱃지가 표시됩니다." },
  { icon: "📈", title: "안정적 수익", desc: "수강생 결제 시 정산율 70%가 매월 지급됩니다." },
  { icon: "📊", title: "수강생 통계", desc: "합격 실적과 수강 현황을 대시보드로 확인할 수 있습니다." },
  { icon: "🎯", title: "노출 우선순위", desc: "인증 강사의 강의는 검색 결과 상단에 노출됩니다." },
];

const REQUIREMENTS = [
  "해당 분야 5년 이상 실무 경력 보유",
  "최근 2년 내 수강생 합격 실적 5건 이상",
  "증빙 가능한 자격증 또는 재직증명서",
  "강의 촬영 가능한 환경 (별도 스튜디오 불필요)",
];

export default function InstructorPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", category: "",
    careerYears: "", passCount: "", intro: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "이름을 입력해주세요";
    if (!form.email) errs.email = "이메일을 입력해주세요";
    if (!form.category) errs.category = "분야를 선택해주세요";
    if (!form.careerYears) errs.careerYears = "경력을 입력해주세요";
    if (!form.passCount) errs.passCount = "합격 실적을 입력해주세요";
    if (!agreed) errs.agree = "개인정보 수집에 동의해주세요";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#E8D5A3]/10 border border-[#E8D5A3]/30 flex items-center justify-center text-3xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="font-['DM_Serif_Display'] text-3xl mb-4">신청이 완료되었습니다</h2>
          <p className="text-white/40 leading-relaxed mb-8">
            영업일 기준 3~5일 내로 검토 후<br />
            입력하신 이메일로 결과를 안내해드립니다.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8D5A3] text-[#0a0a0f] font-semibold text-sm rounded-full hover:bg-white transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16">

      {/* ── 헤더 ── */}
      <div className="max-w-2xl mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-[#E8D5A3]" />
          <span className="text-[#E8D5A3] text-xs font-semibold tracking-[0.2em] uppercase">Instructor Certification</span>
        </div>
        <h1 className="font-['DM_Serif_Display'] text-5xl font-normal leading-tight mb-5">
          강사 인증 신청
        </h1>
        <p className="text-white/40 text-lg leading-relaxed">
          검증된 전문가만이 강의를 등록할 수 있습니다.<br />
          신청서를 제출하면 관리자가 검토 후 연락드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

        {/* ── 왼쪽: 신청 폼 ── */}
        <div>
          {/* 신청 자격 */}
          <div className="mb-10 p-6 bg-[#111118] border border-white/[0.06] rounded-2xl">
            <h3 className="font-semibold text-sm mb-4 text-white/70">신청 자격 요건</h3>
            <ul className="space-y-2.5">
              {REQUIREMENTS.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8D5A3] mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* 신청서 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-['DM_Serif_Display'] text-2xl mb-6">신청서 작성</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 이름 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">이름 *</label>
                <input
                  type="text" placeholder="홍길동" value={form.name} onChange={set("name")}
                  className={`w-full bg-[#111118] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    errors.name ? "border-red-500/50" : "border-white/[0.07] focus:border-[#E8D5A3]/40"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">이메일 *</label>
                <input
                  type="email" placeholder="example@email.com" value={form.email} onChange={set("email")}
                  className={`w-full bg-[#111118] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    errors.email ? "border-red-500/50" : "border-white/[0.07] focus:border-[#E8D5A3]/40"
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 연락처 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">연락처</label>
                <input
                  type="tel" placeholder="010-0000-0000" value={form.phone} onChange={set("phone")}
                  className="w-full bg-[#111118] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E8D5A3]/40 transition-colors"
                />
              </div>

              {/* 강의 분야 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">강의 분야 *</label>
                <select
                  value={form.category} onChange={set("category")}
                  className={`w-full bg-[#111118] border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
                    errors.category ? "border-red-500/50" : "border-white/[0.07] focus:border-[#E8D5A3]/40"
                  }`}
                >
                  <option value="" className="bg-[#111118]">선택하세요</option>
                  <option value="it" className="bg-[#111118]">IT/개발</option>
                  <option value="biz" className="bg-[#111118]">경영/회계</option>
                  <option value="lang" className="bg-[#111118]">언어</option>
                  <option value="elec" className="bg-[#111118]">전기/전자</option>
                  <option value="safe" className="bg-[#111118]">안전/환경</option>
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 경력 연수 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">실무 경력 *</label>
                <input
                  type="text" placeholder="예: 8년 (정보처리기사 강의)" value={form.careerYears} onChange={set("careerYears")}
                  className={`w-full bg-[#111118] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    errors.careerYears ? "border-red-500/50" : "border-white/[0.07] focus:border-[#E8D5A3]/40"
                  }`}
                />
                {errors.careerYears && <p className="text-red-400 text-xs mt-1">{errors.careerYears}</p>}
              </div>

              {/* 합격 실적 */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">수강생 합격 실적 *</label>
                <input
                  type="text" placeholder="예: 최근 2년 내 30명 합격" value={form.passCount} onChange={set("passCount")}
                  className={`w-full bg-[#111118] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                    errors.passCount ? "border-red-500/50" : "border-white/[0.07] focus:border-[#E8D5A3]/40"
                  }`}
                />
                {errors.passCount && <p className="text-red-400 text-xs mt-1">{errors.passCount}</p>}
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">강사 소개</label>
              <textarea
                placeholder="강의 방식, 전문 분야, 수강생에게 전달하고 싶은 가치 등을 자유롭게 작성해주세요."
                value={form.intro} onChange={set("intro")} rows={4}
                className="w-full bg-[#111118] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E8D5A3]/40 transition-colors resize-none"
              />
            </div>

            {/* 동의 */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#E8D5A3]"
                />
                <span className="text-xs text-white/40 leading-relaxed">
                  개인정보 수집·이용에 동의합니다. 수집된 정보는 강사 심사 목적으로만 활용됩니다.
                </span>
              </label>
              {errors.agree && <p className="text-red-400 text-xs mt-1 ml-7">{errors.agree}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#E8D5A3] text-[#0a0a0f] font-semibold text-sm tracking-wide hover:bg-white transition-colors mt-2"
            >
              신청서 제출하기
            </button>
          </form>
        </div>

        {/* ── 오른쪽: 사이드 정보 ── */}
        <div className="space-y-6">
          {/* 심사 절차 */}
          <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="font-['DM_Serif_Display'] text-xl mb-6">심사 절차</h3>
            <div className="space-y-6">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <span className="font-['DM_Serif_Display'] text-2xl text-[#E8D5A3]/40 shrink-0 leading-none">{step.num}</span>
                  <div>
                    <p className="font-semibold text-sm mb-1">{step.title}</p>
                    <p className="text-white/35 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 혜택 */}
          <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="font-['DM_Serif_Display'] text-xl mb-6">인증 강사 혜택</h3>
            <div className="space-y-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-3">
                  <span className="text-lg shrink-0">{b.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{b.title}</p>
                    <p className="text-white/35 text-xs leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 문의 */}
          <div className="p-5 border border-[#E8D5A3]/15 rounded-2xl">
            <p className="text-xs text-white/40 leading-relaxed">
              궁금한 점이 있으신가요?<br />
              <a href="mailto:instructor@certificatedu.com" className="text-[#E8D5A3] hover:underline">
                instructor@certificatedu.com
              </a>
              으로 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
