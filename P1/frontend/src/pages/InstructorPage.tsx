import { useState } from "react";
import { Link } from "react-router-dom";
import s from "../styles/pages.module.css";

const STEPS = [
  { num:"01", title:"신청서 제출", desc:"경력 사항과 수강생 합격 실적을 작성하여 제출합니다." },
  { num:"02", title:"서류 심사", desc:"관리자가 증빙 서류를 검토합니다. 영업일 기준 3~5일 소요." },
  { num:"03", title:"인증 완료", desc:"승인 시 인증 강사 뱃지가 부여되고 강의를 등록할 수 있습니다." },
];
const BENEFITS = [
  { icon:"🏅", title:"인증 뱃지 부여", desc:"프로필과 강의 카드에 인증 강사 뱃지가 표시됩니다." },
  { icon:"📈", title:"안정적 수익", desc:"수강생 결제 시 정산율 70%가 매월 지급됩니다." },
  { icon:"📊", title:"수강생 통계", desc:"합격 실적과 수강 현황을 대시보드로 확인할 수 있습니다." },
  { icon:"🎯", title:"노출 우선순위", desc:"인증 강사 강의는 검색 결과 상단에 우선 노출됩니다." },
];
const REQUIREMENTS = [
  "해당 분야 5년 이상 실무 경력 보유",
  "최근 2년 내 수강생 합격 실적 5건 이상",
  "증빙 가능한 자격증 또는 재직증명서",
  "강의 촬영 가능한 환경 (별도 스튜디오 불필요)",
];

export default function InstructorPage() {
  const [form, setForm] = useState({ name:"",email:"",phone:"",category:"",careerYears:"",passCount:"",intro:"" });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const set = (key:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[key]:e.target.value}));

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!form.name) errs.name = "이름을 입력해주세요";
    if (!form.email) errs.email = "이메일을 입력해주세요";
    if (!form.category) errs.category = "분야를 선택해주세요";
    if (!form.careerYears) errs.careerYears = "경력을 입력해주세요";
    if (!form.passCount) errs.passCount = "합격 실적을 입력해주세요";
    if (!agreed) errs.agree = "개인정보 수집에 동의해주세요";
    if (Object.keys(errs).length>0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className={s.instrSuccessWrap}>
      <div className={s.instrSuccessBox}>
        <div className={s.instrSuccessIcon}>✓</div>
        <h2 className={s.instrSuccessTitle}>신청 완료!</h2>
        <p className={s.instrSuccessDesc}>영업일 기준 3~5일 내로 검토 후<br />입력하신 이메일로 결과를 안내해드립니다.</p>
        <Link to="/" className={s.btnPrimary}>홈으로 돌아가기</Link>
      </div>
    </div>
  );

  return (
    <div className={s.container}>
      <span className={s.instrBadge}>✓ 강사 인증 프로그램</span>
      <h1 className={s.instrTitle}>강사 인증 <span className={s.accentBlue}>신청</span></h1>
      <p className={s.instrSub}>검증된 전문가만이 강의를 등록할 수 있습니다.<br />신청서를 제출하면 관리자가 검토 후 연락드립니다.</p>

      <div className={s.instrLayout}>
        <div>
          <div className={s.requireBox}>
            <h3 className={s.requireTitle}>신청 자격 요건</h3>
            <ul className={s.requireList}>
              {REQUIREMENTS.map((r,i)=>(
                <li key={i} className={s.requireItem}><span className={s.requireCheck}>✓</span>{r}</li>
              ))}
            </ul>
          </div>
          <h3 className={s.instrFormTitle}>신청서 작성</h3>
          <form className={s.instrForm} onSubmit={handleSubmit}>
            <div className={s.instrFormGrid}>
              {[{key:"name",label:"이름 *",ph:"홍길동",type:"text"},{key:"email",label:"이메일 *",ph:"example@email.com",type:"email"}].map(({key,label,ph,type})=>(
                <div className={s.formGroup} key={key}>
                  <label className={s.formLabel}>{label}</label>
                  <input type={type} placeholder={ph} value={(form as any)[key]} onChange={set(key)}
                    className={`${s.formInput} ${errors[key]?s.formInputError:""}`} />
                  {errors[key]&&<p className={s.formError}>{errors[key]}</p>}
                </div>
              ))}
            </div>
            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>연락처</label>
                <input type="tel" placeholder="010-0000-0000" value={form.phone} onChange={set("phone")} className={s.formInput} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>강의 분야 *</label>
                <select value={form.category} onChange={set("category")} className={`${s.instrSelect} ${errors.category?s.instrSelectError:""}`}>
                  <option value="">선택하세요</option>
                  {[["it","IT/개발"],["biz","경영/회계"],["lang","언어"],["elec","전기/전자"],["safe","안전/환경"]].map(([v,l])=>(
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                {errors.category&&<p className={s.formError}>{errors.category}</p>}
              </div>
            </div>
            <div className={s.instrFormGrid}>
              {[{key:"careerYears",label:"실무 경력 *",ph:"예: 8년 (정보처리기사 강의)"},{key:"passCount",label:"수강생 합격 실적 *",ph:"예: 최근 2년 내 30명 합격"}].map(({key,label,ph})=>(
                <div className={s.formGroup} key={key}>
                  <label className={s.formLabel}>{label}</label>
                  <input type="text" placeholder={ph} value={(form as any)[key]} onChange={set(key)}
                    className={`${s.formInput} ${errors[key]?s.formInputError:""}`} />
                  {errors[key]&&<p className={s.formError}>{errors[key]}</p>}
                </div>
              ))}
            </div>
            <div className={s.formGroup}>
              <label className={s.formLabel}>강사 소개</label>
              <textarea placeholder="강의 방식, 전문 분야, 수강생에게 전달하고 싶은 가치 등을 자유롭게 작성해주세요." value={form.intro} onChange={set("intro")} rows={4} className={s.instrTextarea} />
            </div>
            <div>
              <label className={s.instrAgree}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ accentColor:"var(--accent)", marginTop:2 }} />
                <span className={s.instrAgreeText}>개인정보 수집·이용에 동의합니다. 수집된 정보는 강사 심사 목적으로만 활용됩니다.</span>
              </label>
              {errors.agree&&<p className={s.formError} style={{marginTop:"0.25rem",marginLeft:"1.5rem"}}>{errors.agree}</p>}
            </div>
            <button type="submit" className={s.instrSubmit}>신청서 제출하기</button>
          </form>
        </div>
        <div>
          <div className={s.instrSideCard}>
            <h3 className={s.instrSideTitle}>심사 절차</h3>
            <div className={s.stepList}>
              {STEPS.map(step=>(
                <div key={step.num} className={s.stepItem}>
                  <span className={s.stepNum}>{step.num}</span>
                  <div><p className={s.stepTitle}>{step.title}</p><p className={s.stepDesc}>{step.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className={s.instrSideCard}>
            <h3 className={s.instrSideTitle}>인증 강사 혜택</h3>
            <div className={s.benefitList}>
              {BENEFITS.map(b=>(
                <div key={b.title} className={s.benefitItem}>
                  <span className={s.benefitIcon}>{b.icon}</span>
                  <div><p className={s.benefitTitle}>{b.title}</p><p className={s.benefitDesc}>{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className={s.instrContactBox}>
            <p className={s.instrContactText}>
              궁금한 점이 있으신가요?<br />
              <a href="mailto:instructor@certificatedu.com" className={s.instrContactLink}>instructor@certificatedu.com</a>으로 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
