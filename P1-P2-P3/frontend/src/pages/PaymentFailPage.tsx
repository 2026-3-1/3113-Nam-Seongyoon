import { Link, useSearchParams } from "react-router-dom";
import s from "../styles/pages.module.css";

export default function PaymentFailPage() {
  const [params] = useSearchParams();
  const code = params.get("code") ?? "";
  const message = params.get("message") ?? "알 수 없는 오류가 발생했습니다.";

  return (
    <div className={s.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😔</div>
      <h2 className={s.pageTitle} style={{ color: "#e53e3e" }}>결제가 취소되었습니다</h2>
      <p className={s.pageSub}>{message}</p>
      {code && <p style={{ color: "#999", fontSize: "0.8rem", marginTop: "0.5rem" }}>오류 코드: {code}</p>}
      <Link to="/cart" className={s.btnPrimary} style={{ marginTop: "2rem", display: "inline-block" }}>
        장바구니로 돌아가기
      </Link>
    </div>
  );
}
