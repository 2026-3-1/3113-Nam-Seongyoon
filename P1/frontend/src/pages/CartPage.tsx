import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import s from "../styles/pages.module.css";

export default function CartPage() {
  const [items, setItems] = useState(COURSES.slice(0,3).map(c=>({...c,selected:true})));
  const selected = items.filter(i=>i.selected);
  const total = selected.reduce((sum,c)=>sum+c.price,0);
  const origTotal = selected.reduce((sum,c)=>sum+(c.originalPrice??c.price),0);
  const saved = origTotal - total;

  const toggle = (id:number) => setItems(i=>i.map(x=>x.id===id?{...x,selected:!x.selected}:x));
  const remove = (id:number) => setItems(i=>i.filter(x=>x.id!==id));
  const toggleAll = () => { const all=items.every(i=>i.selected); setItems(i=>i.map(x=>({...x,selected:!all}))); };

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
      <h1 className={s.pageTitle} style={{ marginBottom:"2rem" }}>장바구니 <span className={s.accentBlue}>({items.length})</span></h1>
      <div className={s.cartLayout}>
        <div className={s.cartLeft}>
          <div className={s.cartSelectAll}>
            <label className={s.selectAllLabel}>
              <input type="checkbox" checked={items.every(i=>i.selected)} onChange={toggleAll} style={{ accentColor:"var(--accent)" }} />
              전체 선택 ({selected.length}/{items.length})
            </label>
          </div>
          <div className={s.cartItems}>
            {items.map(item=>{
              const disc=item.originalPrice?Math.round((1-item.price/item.originalPrice)*100):null;
              return (
                <div key={item.id} className={`${s.cartItem} ${!item.selected?s.cartItemDeselected:""}`}>
                  <input type="checkbox" checked={item.selected} onChange={()=>toggle(item.id)} style={{ accentColor:"var(--accent)", marginTop:4 }} />
                  <Link to={`/courses/${item.id}`} className={s.cartThumb}>{item.thumbnail}</Link>
                  <div className={s.cartInfo}>
                    <Link to={`/courses/${item.id}`} className={s.cartItemTitle}>{item.title}</Link>
                    <p className={s.cartItemMeta}>{item.instructor} 강사 · {item.duration}</p>
                    <p className={s.cartItemRating}>★ {item.rating} ({item.reviewCount.toLocaleString()})</p>
                  </div>
                  <div className={s.cartPriceCol}>
                    <button onClick={()=>remove(item.id)} className={s.cartRemove}>×</button>
                    <div>
                      {item.originalPrice&&<div style={{display:"flex",gap:6,justifyContent:"flex-end",marginBottom:2}}>
                        <span className={s.cartOrigPrice}>{item.originalPrice.toLocaleString()}원</span>
                        {disc&&<span className={s.cartDiscountPct}>{disc}%</span>}
                      </div>}
                      <span className={s.cartItemPrice}>{item.price.toLocaleString()}원</span>
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
              {saved>0&&<div className={s.summaryRow}><span className={s.summaryLabel}>할인 금액</span><span className={s.summaryDiscount}>-{saved.toLocaleString()}원</span></div>}
            </div>
            <div className={s.summaryTotal}>
              <span className={s.summaryTotalLabel}>최종 결제 금액</span>
              <span className={s.summaryTotalPrice}>{total.toLocaleString()}원</span>
            </div>
            {saved>0&&<div className={s.savingsBadge} style={{marginTop:"1rem"}}>🎉 {saved.toLocaleString()}원 절약!</div>}
            <button disabled={selected.length===0} className={s.btnCheckout} style={{marginTop:"1rem"}}>
              {selected.length>0?`${selected.length}개 강의 결제하기`:"강의를 선택해주세요"}
            </button>
            <Link to="/courses" className={s.summaryMoreLink}>강의 더 담기 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
