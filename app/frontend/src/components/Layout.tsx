import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, clearAuth, getAuth, type AuthState } from "../lib/api";
import s from "../styles/Layout.module.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuthState] = useState<AuthState | null>(() => getAuth());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  useEffect(() => {
    const sync = () => setAuthState(getAuth());
    window.addEventListener("auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const logout = () => {
    api.logout().catch(() => clearAuth()).finally(() => navigate("/"));
  };

  const isInstructor = auth?.user.role === "TEACHER";
  const isAdmin = auth?.user.role === "ADMIN";
  const navLinks = isInstructor
    ? [
        { to: "/instructor", label: "강의 등록" },
        { to: "/mypage", label: "마이페이지" },
      ]
    : [
        { to: "/courses", label: "강의 보기" },
        { to: "/cart", label: "장바구니" },
        ...(isAdmin ? [{ to: "/instructor", label: "강의 관리" }] : []),
        { to: "/mypage", label: "마이페이지" },
      ];

  return (
    <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`}>
      <div className={s.navInner}>
        <Link to="/" className={s.logo}>CertificatEdu</Link>
        <ul className={s.navLinks}>
          {navLinks.map(({ to, label }) => (
            <li key={label}>
              <Link to={to} className={`${s.navLink} ${location.pathname === to ? s.navLinkActive : ""}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={s.navActions}>
          {auth ? (
            <>
              {!isInstructor && <Link to="/cart" className={s.btnGhost}>장바구니</Link>}
              <span className={s.btnGhost}>{auth.user.name} · {auth.user.role}</span>
              <button onClick={logout} className={s.btnPrimary}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/cart" className={s.btnGhost}>장바구니</Link>
              <Link to="/login" className={s.btnGhost}>로그인</Link>
              <Link to="/register" className={s.btnPrimary}>회원가입</Link>
            </>
          )}
        </div>
        <button className={s.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴">
          <span style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : "" }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "" }} />
        </button>
      </div>
      {menuOpen && (
        <div className={s.mobileMenu}>
          {navLinks.map(({ to, label }) => (
            <Link key={label} to={to} className={s.navLink}>{label}</Link>
          ))}
          <div className={s.mobileActions}>
            {auth ? (
              <button onClick={logout} className={`${s.mobileBtn} ${s.mobileBtnPrimary}`}>로그아웃</button>
            ) : (
              <>
                <Link to="/login" className={`${s.mobileBtn} ${s.mobileBtnGhost}`}>로그인</Link>
                <Link to="/register" className={`${s.mobileBtn} ${s.mobileBtnPrimary}`}>회원가입</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <span className={s.footerLogo}>CertificatEdu</span>
        <div className={s.footerLinks}>
          <a href="#" className={s.footerLink}>이용약관</a>
          <a href="#" className={s.footerLink}>개인정보처리방침</a>
          <a href="#" className={s.footerLink}>고객센터</a>
        </div>
        <p className={s.footerCopy}>© 2026 CertificatEdu. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.layout}>
      <Navbar />
      <main className={s.main}>{children}</main>
      <Footer />
    </div>
  );
}
