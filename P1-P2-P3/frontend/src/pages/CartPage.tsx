import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { api, getAuth, type AuthState } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { CartItem } from "../types";
import s from "../styles/pages.module.css";

export default function CartPage() {
  const [auth, setAuth] = useState<AuthState | null>(() => getAuth());
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(Boolean(auth));
  const [message, setMessage] = useState("");

  useEffect(() => {
    const syncAuth = () => setAuth(getAuth());
    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .cart()
      .then((data) => {
        setItems(data);
        setMessage("");
      })
      .catch((error) => {
        setItems([]);
        setMessage(error instanceof Error ? error.message : "장바구니를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [auth?.accessToken]);

  const selected = useMemo(() => items.filter((item) => item.selected), [items]);
  const total = selected.reduce((sum, item) => sum + item.course.price, 0);
  const origTotal = selected.reduce((sum, item) => {
    const originalPrice = item.course.originalPrice;
    return sum + (originalPrice && originalPrice > item.course.price ? originalPrice : item.course.price);
  }, 0);
  const saved = origTotal - total;

  const updateSelected = async (id: number, selectedValue: boolean) => {
    const previous = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, selected: selectedValue } : item)));
    try {
      await api.updateCartItem(id, { selected: selectedValue });
    } catch (error) {
      setItems(previous);
      setMessage(error instanceof Error ? error.message : "장바구니를 수정하지 못했습니다.");
    }
  };

  const remove = async (id: number) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await api.removeCartItem(id);
    } catch (error) {
      setItems(previous);
      setMessage(error instanceof Error ? error.message : "장바구니에서 삭제하지 못했습니다.");
    }
  };

  const toggleAll = async () => {
    const nextSelected = !items.every((item) => item.selected);
    const previous = items;
    setItems((current) => current.map((item) => ({ ...item, selected: nextSelected })));
    try {
      await Promise.all(items.map((item) => api.updateCartItem(item.id, { selected: nextSelected })));
    } catch (error) {
      setItems(previous);
      setMessage(error instanceof Error ? error.message : "전체 선택을 변경하지 못했습니다.");
    }
  };

  const checkout = async () => {
    if (selected.length === 0) {
      setMessage("결제할 강의를 선택해 주세요.");
      return;
    }

    try {
      const [info, { tossClientKey }] = await Promise.all([
        api.initiateCheckout(),
        api.config(),
      ]);
      if (!info.ok) { setMessage(info.message ?? "결제를 시작할 수 없습니다."); return; }
      if (!tossClientKey) { setMessage("결제 서비스가 설정되지 않았습니다."); return; }

      const tossPayments = await loadTossPayments(tossClientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: info.amount },
        orderId: info.tossOrderId,
        orderName: info.orderName,
        customerEmail: info.customerEmail,
        customerName: info.customerName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제를 시작하지 못했습니다.");
    }
  };

  if (!auth) {
    return (
      <div className={s.container}>
        <h1 className={s.pageTitle}>장바구니</h1>
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>로그인이 필요합니다.</div>
          <p className={s.emptyDesc}>장바구니는 계정별로 저장됩니다. 로그인 후 강의를 담아 주세요.</p>
          {message && <p className={s.formError}>{message}</p>}
          <Link to="/login" className={s.btnPrimary}>로그인하기</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={s.container}>
        <h1 className={s.pageTitle}>장바구니</h1>
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>장바구니를 불러오는 중입니다.</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={s.container}>
        <div className={s.cartEmpty}>
          <div className={s.cartEmptyIcon}>Cart</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>장바구니가 비어 있습니다</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "2rem" }}>관심 있는 강의를 담아보세요.</p>
          {message && <p className={s.formError}>{message}</p>}
          <Link to="/courses" className={s.btnPrimary}>강의 둘러보기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <h1 className={s.pageTitle} style={{ marginBottom: "2rem" }}>장바구니 <span className={s.accentBlue}>({items.length})</span></h1>
      {message && <p className={s.formError} style={{ marginBottom: "1rem" }}>{message}</p>}
      <div className={s.cartLayout}>
        <div className={s.cartLeft}>
          <div className={s.cartSelectAll}>
            <label className={s.selectAllLabel}>
              <input type="checkbox" checked={items.every((item) => item.selected)} onChange={toggleAll} style={{ accentColor: "var(--accent)" }} />
              전체 선택 ({selected.length}/{items.length})
            </label>
          </div>
          <div className={s.cartItems}>
            {items.map((item) => {
              const course = item.course;
              const originalPrice = course.originalPrice && course.originalPrice > course.price ? course.originalPrice : null;
              const discount = originalPrice ? Math.round((1 - course.price / originalPrice) * 100) : null;
              return (
                <div key={item.id} className={`${s.cartItem} ${!item.selected ? s.cartItemDeselected : ""}`}>
                  <input type="checkbox" checked={item.selected} onChange={() => updateSelected(item.id, !item.selected)} style={{ accentColor: "var(--accent)", marginTop: 4 }} />
                  <Link to={`/courses/${course.id}`} className={s.cartThumb}>
                    {isImageSource(course.thumbnail) ? <img src={course.thumbnail} alt="" className={s.thumbImage} /> : "No image"}
                  </Link>
                  <div className={s.cartInfo}>
                    <Link to={`/courses/${course.id}`} className={s.cartItemTitle}>{course.title}</Link>
                    <p className={s.cartItemMeta}>{course.teacher?.name ?? "인증 강사"} · {course.duration}</p>
                    <p className={s.cartItemRating}>★ {Number(course.rating).toFixed(1)} ({course.reviewCount.toLocaleString()})</p>
                  </div>
                  <div className={s.cartPriceCol}>
                    <button type="button" onClick={() => remove(item.id)} className={s.cartRemove}>×</button>
                    <div>
                      {originalPrice && (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 2 }}>
                          <span className={s.cartOrigPrice}>{originalPrice.toLocaleString()}원</span>
                          {discount && <span className={s.cartDiscountPct}>{discount}%</span>}
                        </div>
                      )}
                      <span className={s.cartItemPrice}>{course.price.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={s.cartRight}>
          <div className={s.summaryCard}>
            <h3 className={s.summaryTitle}>결제 금액</h3>
            <div className={s.summaryRows}>
              <div className={s.summaryRow}><span className={s.summaryLabel}>선택 강의 ({selected.length}개)</span><span>{origTotal.toLocaleString()}원</span></div>
              {saved > 0 && <div className={s.summaryRow}><span className={s.summaryLabel}>할인 금액</span><span className={s.summaryDiscount}>-{saved.toLocaleString()}원</span></div>}
            </div>
            <div className={s.summaryTotal}>
              <span className={s.summaryTotalLabel}>최종 결제 금액</span>
              <span className={s.summaryTotalPrice}>{total.toLocaleString()}원</span>
            </div>
            {saved > 0 && <div className={s.savingsBadge} style={{ marginTop: "1rem" }}>{saved.toLocaleString()}원 절약</div>}
            <button type="button" onClick={checkout} disabled={selected.length === 0} className={s.btnCheckout} style={{ marginTop: "1rem" }}>
              {selected.length > 0 ? `${selected.length}개 강의 결제하기` : "강의를 선택해주세요"}
            </button>
            <Link to="/courses" className={s.summaryMoreLink}>강의 더 담기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
