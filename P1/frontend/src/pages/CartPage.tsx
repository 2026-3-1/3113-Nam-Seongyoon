import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart, removeFromCart, createOrder } from "../api";
import s from "../styles/pages.module.css";

interface CartCourse {
  id: number;
  title: string;
  instructorName: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  duration?: string;
  rating: number;
  reviewCount: number;
}

interface CartItem {
  id: number;
  course: CartCourse;
  selected: boolean;
}

export default function CartPage() {
  const { id: userId } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [toast, setToast] = useState("");

  const fetchCart = () =>
    getCart(userId).then((data: any[]) =>
      setItems(data.map(item => ({ ...item, selected: true })))
    ).finally(() => setLoading(false));

  useEffect(() => { fetchCart(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const toggle    = (id: number) => setItems(prev => prev.map(x => x.id === id ? { ...x, selected: !x.selected } : x));
  const toggleAll = () => { const all = items.every(i => i.selected); setItems(prev => prev.map(x => ({ ...x, selected: !all }))); };

  const remove = async (courseId: number) => {
    await removeFromCart(userId, courseId);
    setItems(prev => prev.filter(x => x.course.id !== courseId));
    showToast("강의가 장바구니에서 제거됐습니다.");
  };

  const checkout = async () => {
    const selectedIds = items.filter(i => i.selected).map(i => i.course.id);
    if (selectedIds.length === 0) return;
    setOrdering(true);
    try {
      await createOrder(userId, selectedIds);
      showToast("결제가 완료됐습니다! 수강을 시작하세요.");
      setTimeout(() => navigate("/mypage"), 1200);
    } catch {
      showToast("결제 중 오류가 발생했습니다.");
    } finally {
      setOrdering(false);
    }
  };

  const selected = items.filter(i => i.selected);
  const total    = selected.reduce((sum, i) => sum + i.course.price, 0);
  const origTotal = selected.reduce((sum, i) => sum + (i.course.originalPrice ?? i.course.price), 0);
  const saved    = origTotal - total;

  if (loading) return <div className={s.container}>로딩 중...</div>;

  if (items.length === 0) return (
    <div className={s.container}>
      <div className={s.cartEmpty}>
        <div className={s.cartEmptyIcon}>🛒</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.25rem", marginBottom:"0.5rem" }}>장바구니가 비어 있습니다</h2>
        <p style={{ color:"var(--muted)", fontSize:"0.875rem", marginBottom:"2rem" }}>관심 있는 강의를 담아보세요</p>
        <Link to="/courses" className={s.btnPrimary}>강의 둘러보기</Link>
      </div>
    </div>
  );

  return (
    <div className={s.container}>
      {toast && (
        <div style={{
          position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
          background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-sm)", padding:"0.75rem 1.5rem",
          color:"var(--text)", fontSize:"0.875rem", zIndex:999,
          boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}
      <h1 className={s.pageTitle} style={{ marginBottom:"2rem" }}>
        장바구니 <span className={s.accentBlue}>({items.length})</span>
      </h1>
      <div className={s.cartLayout}>
        <div className={s.cartLeft}>
          <div className={s.cartSelectAll}>
            <label className={s.selectAllLabel}>
              <input type="checkbox" checked={items.every(i => i.selected)} onChange={toggleAll} style={{ accentColor:"var(--accent)" }} />
              전체 선택 ({selected.length}/{items.length})
            </label>
          </div>
          <div className={s.cartItems}>
            {items.map(item => {
              const disc = item.course.originalPrice ? Math.round((1 - item.course.price / item.course.originalPrice) * 100) : null;
              return (
                <div key={item.id} className={`${s.cartItem} ${!item.selected ? s.cartItemDeselected : ""}`}>
                  <input type="checkbox" checked={item.selected} onChange={() => toggle(item.id)} style={{ accentColor:"var(--accent)", marginTop:4 }} />
                  <Link to={`/courses/${item.course.id}`} className={s.cartThumb}>{item.course.thumbnail || "💻"}</Link>
                  <div className={s.cartInfo}>
                    <Link to={`/courses/${item.course.id}`} className={s.cartItemTitle}>{item.course.title}</Link>
                    <p className={s.cartItemMeta}>{item.course.instructorName} 강사 · {item.course.duration}</p>
                    <p className={s.cartItemRating}>★ {item.course.rating} ({item.course.reviewCount.toLocaleString()})</p>
                  </div>
                  <div className={s.cartPriceCol}>
                    <button onClick={() => remove(item.course.id)} className={s.cartRemove}>×</button>
                    <div>
                      {item.course.originalPrice && (
                        <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginBottom:2 }}>
                          <span className={s.cartOrigPrice}>{item.course.originalPrice.toLocaleString()}원</span>
                          {disc && <span className={s.cartDiscountPct}>{disc}%</span>}
                        </div>
                      )}
                      <span className={s.cartItemPrice}>{item.course.price.toLocaleString()}원</span>
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
              <div className={s.summaryRow}>
                <span className={s.summaryLabel}>선택 강의 ({selected.length}개)</span>
                <span>{origTotal.toLocaleString()}원</span>
              </div>
              {saved > 0 && (
                <div className={s.summaryRow}>
                  <span className={s.summaryLabel}>할인 금액</span>
                  <span className={s.summaryDiscount}>-{saved.toLocaleString()}원</span>
                </div>
              )}
            </div>
            <div className={s.summaryTotal}>
              <span className={s.summaryTotalLabel}>최종 결제 금액</span>
              <span className={s.summaryTotalPrice}>{total.toLocaleString()}원</span>
            </div>
            {saved > 0 && <div className={s.savingsBadge} style={{ marginTop:"1rem" }}>🎉 {saved.toLocaleString()}원 절약!</div>}
            <button
              disabled={selected.length === 0 || ordering}
              onClick={checkout}
              className={s.btnCheckout}
              style={{ marginTop:"1rem" }}
            >
              {ordering ? "처리 중..." : selected.length > 0 ? `${selected.length}개 강의 결제하기` : "강의를 선택해주세요"}
            </button>
            <Link to="/courses" className={s.summaryMoreLink}>강의 더 담기 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
