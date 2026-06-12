import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import s from "../styles/pages.module.css";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    api
      .confirmCheckout(paymentKey, orderId, amount)
      .then((res) => {
        setReceiptUrl(res.receiptUrl);
        setStatus("done");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "결제 확인에 실패했습니다.");
      });
  }, [params]);

  if (status === "loading") {
    return (
      <div className={s.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
        <p>결제를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={s.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h2 className={s.pageTitle} style={{ color: "#e53e3e" }}>결제 실패</h2>
        <p className={s.pageSub}>{message}</p>
        <Link to="/cart" className={s.btnPrimary} style={{ marginTop: "2rem", display: "inline-block" }}>장바구니로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={s.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
      <h2 className={s.pageTitle}>결제가 완료되었습니다!</h2>
      <p className={s.pageSub}>수강 신청이 완료되었습니다. 마이페이지에서 강의를 확인하세요.</p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
        <Link to="/mypage" className={s.btnPrimary}>수강 시작하기</Link>
        {receiptUrl && (
          <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className={s.btnSecondary}>
            영수증 보기
          </a>
        )}
      </div>
    </div>
  );
}
