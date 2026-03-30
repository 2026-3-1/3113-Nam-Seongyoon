import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import s from "../styles/pages.module.css";

function FormInput({ label, type="text", placeholder, value, onChange, error }:
  { label:string; type?:string; placeholder:string; value:string; onChange:(v:string)=>void; error?:string }) {
  return (
    <div className={s.formGroup}>
      <label className={s.formLabel}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        className={`${s.formInput} ${error?s.formInputError:""}`} />
      {error && <p className={s.formError}>{error}</p>}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!email) errs.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "올바른 이메일 형식이 아닙니다";
    if (!password) errs.password = "비밀번호를 입력해주세요";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    navigate("/");
  };

  return (
    <div className={s.authWrap}>
      <div className={s.authBg} />
      <div className={s.authCard}>
        <div className={s.authLogoWrap}>
          <Link to="/" className={s.authLogo}>CertificatEdu</Link>
          <p className={s.authTagline}>자격증 합격의 최단 경로</p>
        </div>
        <div className={s.authBox}>
          <h2 className={s.authTitle}>로그인</h2>
          <form className={s.authForm} onSubmit={handleSubmit}>
            <FormInput label="이메일" type="email" placeholder="example@email.com" value={email} onChange={setEmail} error={errors.email} />
            <FormInput label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={setPassword} error={errors.password} />
            <div className={s.authRow}>
              <label className={s.authCheck}><input type="checkbox" style={{ accentColor:"var(--accent)" }} /> 로그인 유지</label>
              <a href="#" className={s.authForgot}>비밀번호 찾기</a>
            </div>
            <button type="submit" className={s.authSubmit}>로그인</button>
          </form>
          <div className={s.authDivider}>
            <div className={s.authDividerLine} /><span className={s.authDividerText}>또는</span><div className={s.authDividerLine} />
          </div>
          <button className={`${s.socialBtn} ${s.socialKakao}`}>💬 카카오로 로그인</button>
          <button className={`${s.socialBtn} ${s.socialNaver}`}>N 네이버로 로그인</button>
        </div>
        <p className={s.authFooter}>
          계정이 없으신가요? <Link to="/register" className={s.authFooterLink}>회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", passwordConfirm:"", role:"LEARNER" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [agreed, setAgreed] = useState(false);
  const set = (key:string) => (v:string) => setForm(f=>({...f,[key]:v}));

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!form.name) errs.name = "이름을 입력해주세요";
    if (!form.email) errs.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "올바른 이메일 형식이 아닙니다";
    if (!form.password) errs.password = "비밀번호를 입력해주세요";
    else if (form.password.length < 8) errs.password = "8자 이상이어야 합니다";
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = "비밀번호가 일치하지 않습니다";
    if (!agreed) errs.agree = "이용약관에 동의해주세요";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    navigate("/login");
  };

  return (
    <div className={s.authWrap}>
      <div className={s.authBg} />
      <div className={s.authCard}>
        <div className={s.authLogoWrap}>
          <Link to="/" className={s.authLogo}>CertificatEdu</Link>
          <p className={s.authTagline}>지금 바로 합격 여정을 시작하세요</p>
        </div>
        <div className={s.authBox}>
          <h2 className={s.authTitle}>회원가입</h2>
          <div className={s.roleToggle}>
            {[{v:"LEARNER",l:"학습자"},{v:"INSTRUCTOR",l:"강사"}].map(({v,l})=>(
              <button key={v} type="button" onClick={()=>setForm(f=>({...f,role:v}))}
                className={`${s.roleBtn} ${form.role===v?s.roleBtnActive:""}`}>{l}</button>
            ))}
          </div>
          <form className={s.authForm} onSubmit={handleSubmit}>
            <FormInput label="이름" placeholder="홍길동" value={form.name} onChange={set("name")} error={errors.name} />
            <FormInput label="이메일" type="email" placeholder="example@email.com" value={form.email} onChange={set("email")} error={errors.email} />
            <div className={s.formGrid2}>
              <FormInput label="비밀번호" type="password" placeholder="8자 이상" value={form.password} onChange={set("password")} error={errors.password} />
              <FormInput label="비밀번호 확인" type="password" placeholder="다시 입력" value={form.passwordConfirm} onChange={set("passwordConfirm")} error={errors.passwordConfirm} />
            </div>
            <div>
              <label className={s.agreeLabel}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ accentColor:"var(--accent)", marginTop:2 }} />
                <span className={s.agreeText}>
                  <a href="#" className={s.agreeLink}>이용약관</a> 및 <a href="#" className={s.agreeLink}>개인정보처리방침</a>에 동의합니다
                </span>
              </label>
              {errors.agree && <p className={s.formError} style={{ marginTop:"0.25rem" }}>{errors.agree}</p>}
            </div>
            <button type="submit" className={s.authSubmit}>가입하기</button>
          </form>
        </div>
        <p className={s.authFooter}>
          이미 계정이 있으신가요? <Link to="/login" className={s.authFooterLink}>로그인</Link>
        </p>
      </div>
    </div>
  );
}
