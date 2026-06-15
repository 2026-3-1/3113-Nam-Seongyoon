import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, setAuth } from "../lib/api";
import type { Role } from "../types";
import s from "../styles/pages.module.css";

function FormInput({ label, type = "text", placeholder, value, onChange, error }: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className={s.formGroup}>
      <label className={s.formLabel}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${s.formInput} ${error ? s.formInputError : ""}`}
      />
      {error && <p className={s.formError}>{error}</p>}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; registered?: boolean } | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const auth = await api.login(email, password);
      setAuth(auth);
      navigate(state?.from ?? (auth.user.role === "TEACHER" || auth.user.role === "ADMIN" ? "/instructor" : "/"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    }
  };

  return (
    <div className={s.authWrap}>
      <div className={s.authCard}>
        <div className={s.authLogoWrap}>
          <Link to="/" className={s.authLogo}>CertificatEdu</Link>
          <p className={s.authTagline}>자격증 합격을 위한 온라인 강의 플랫폼</p>
        </div>
        <div className={s.authBox}>
          <h2 className={s.authTitle}>로그인</h2>
          {state?.registered && <p className={s.formError}>회원가입이 완료되었습니다. 로그인해주세요.</p>}
          <form className={s.authForm} onSubmit={handleSubmit}>
            <FormInput label="이메일" type="email" placeholder="example@email.com" value={email} onChange={setEmail} />
            <FormInput label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={setPassword} />
            {error && <p className={s.formError}>{error}</p>}
            <button type="submit" className={s.authSubmit}>로그인</button>
          </form>
        </div>
        <p className={s.authFooter}>
          계정이 없나요? <Link to="/register" className={s.authFooterLink}>회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "", role: "STUDENT" as Role });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    try {
      await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className={s.authWrap}>
      <div className={s.authCard}>
        <div className={s.authLogoWrap}>
          <Link to="/" className={s.authLogo}>CertificatEdu</Link>
          <p className={s.authTagline}>학습자와 선생님 계정을 선택해 가입하세요.</p>
        </div>
        <div className={s.authBox}>
          <h2 className={s.authTitle}>회원가입</h2>
          <div className={s.roleToggle}>
            {[
              { value: "STUDENT", label: "학생" },
              { value: "TEACHER", label: "선생님" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: value as Role }))}
                className={`${s.roleBtn} ${form.role === value ? s.roleBtnActive : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          <form className={s.authForm} onSubmit={handleSubmit}>
            <FormInput label="이름" placeholder="홍길동" value={form.name} onChange={set("name")} />
            <FormInput label="이메일" type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} />
            <FormInput label="비밀번호" type="password" placeholder="8자 이상" value={form.password} onChange={set("password")} />
            <FormInput label="비밀번호 확인" type="password" placeholder="다시 입력" value={form.passwordConfirm} onChange={set("passwordConfirm")} />
            {error && <p className={s.formError}>{error}</p>}
            <button type="submit" className={s.authSubmit}>가입하기</button>
          </form>
        </div>
        <p className={s.authFooter}>
          이미 계정이 있나요? <Link to="/login" className={s.authFooterLink}>로그인</Link>
        </p>
      </div>
    </div>
  );
}
