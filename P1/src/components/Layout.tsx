import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const navLinks = [
    { to: "/courses", label: "강의" },
    { to: "/instructor", label: "강사 인증" },
    { to: "/courses", label: "자격증 찾기" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-[#E8D5A3]/10" : ""
    }`}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="font-['DM_Serif_Display'] text-xl font-normal tracking-tight text-white">
          Certificat<span className="text-[#E8D5A3]">Edu</span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          {navLinks.map(({ to, label }) => (
            <li key={label}>
              <Link to={to} className={`text-sm font-medium tracking-wide transition-colors ${
                location.pathname === to ? "text-[#E8D5A3]" : "text-white/50 hover:text-white"
              }`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-colors">
            로그인
          </Link>
          <Link to="/register" className="px-4 py-2 rounded-lg bg-[#E8D5A3] text-sm font-semibold text-[#0a0a0f] hover:bg-[#F0E0B0] transition-colors">
            회원가입
          </Link>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0a0a0f] border-b border-white/10 px-6 py-5 flex flex-col gap-4 md:hidden">
          {navLinks.map(({ to, label }) => (
            <Link key={label} to={to} className="text-sm text-white/70">{label}</Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg border border-white/10 text-sm text-white/70">로그인</Link>
            <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg bg-[#E8D5A3] text-sm font-semibold text-[#0a0a0f]">회원가입</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-['DM_Serif_Display'] text-lg text-white">
          Certificat<span className="text-[#E8D5A3]">Edu</span>
        </span>
        <div className="flex gap-6 text-white/30 text-sm">
          <a href="#" className="hover:text-white/70 transition-colors">이용약관</a>
          <a href="#" className="hover:text-white/70 transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-white/70 transition-colors">고객센터</a>
        </div>
        <p className="text-white/20 text-xs">© 2026 CertificatEdu</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
