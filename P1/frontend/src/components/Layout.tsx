import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import s from "../styles/Layout.module.css";

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
          <Link to="/login" className={s.btnGhost}>로그인</Link>
          <Link to="/register" className={s.btnPrimary}>회원가입</Link>
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
            <Link to="/login" className={`${s.mobileBtn} ${s.mobileBtnGhost}`}>로그인</Link>
            <Link to="/register" className={`${s.mobileBtn} ${s.mobileBtnPrimary}`}>회원가입</Link>
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
