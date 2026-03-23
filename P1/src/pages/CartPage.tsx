import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES } from "../data/courses";

export default function CartPage() {
  const [cartItems, setCartItems] = useState(COURSES.slice(0, 3).map((c) => ({ ...c, selected: true })));

  const selected = cartItems.filter((c) => c.selected);
  const total = selected.reduce((sum, c) => sum + c.price, 0);
  const originalTotal = selected.reduce((sum, c) => sum + (c.originalPrice ?? c.price), 0);
  const savedAmount = originalTotal - total;

  const toggleSelect = (id: number) =>
    setCartItems((items) => items.map((i) => i.id === id ? { ...i, selected: !i.selected } : i));

  const removeItem = (id: number) =>
    setCartItems((items) => items.filter((i) => i.id !== id));

  const toggleAll = () => {
    const allSelected = cartItems.every((i) => i.selected);
    setCartItems((items) => items.map((i) => ({ ...i, selected: !allSelected })));
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
      <h1 className="font-['Syne'] text-2xl font-extrabold tracking-tight mb-8">
        장바구니 <span className="text-[#4F8EF7]">({cartItems.length})</span>
      </h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <p className="text-white font-semibold text-lg mb-2">장바구니가 비어 있습니다</p>
          <p className="text-[#7A7D85] text-sm mb-8">관심 있는 강의를 담아보세요</p>
          <Link to="/courses" className="px-6 py-3 rounded-xl bg-[#4F8EF7] text-sm font-bold text-white hover:opacity-85 transition-opacity">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Item List ── */}
          <div className="flex-1 min-w-0">
            {/* Select All */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.07]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cartItems.every((i) => i.selected)}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-[#4F8EF7]"
                />
                <span className="text-sm font-medium">전체 선택 ({selected.length}/{cartItems.length})</span>
              </label>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => {
                const discount = item.originalPrice
                  ? Math.round((1 - item.price / item.originalPrice) * 100)
                  : null;
                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                      item.selected
                        ? "bg-[#141517] border-white/[0.07]"
                        : "bg-[#0f1011] border-white/[0.04] opacity-60"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 accent-[#4F8EF7]"
                      />
                    </div>

                    {/* Thumbnail */}
                    <Link to={`/courses/${item.id}`} className="w-20 h-16 bg-[#1c1e22] rounded-xl flex items-center justify-center text-2xl shrink-0 hover:opacity-80 transition-opacity">
                      {item.thumbnail}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/courses/${item.id}`} className="text-sm font-semibold hover:text-[#4F8EF7] transition-colors line-clamp-2 block mb-1">
                        {item.title}
                      </Link>
                      <p className="text-[#7A7D85] text-xs mb-2">{item.instructor} 강사 · {item.duration}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[#F5C518] text-xs">★ {item.rating}</span>
                        <span className="text-[#7A7D85] text-xs">({item.reviewCount.toLocaleString()})</span>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <button onClick={() => removeItem(item.id)} className="text-[#7A7D85] hover:text-white text-lg leading-none transition-colors">×</button>
                      <div className="text-right">
                        {item.originalPrice && (
                          <div className="flex items-center gap-1.5 justify-end mb-0.5">
                            <span className="text-[#7A7D85] text-xs line-through">{item.originalPrice.toLocaleString()}원</span>
                            {discount && <span className="text-[#FF4757] text-[0.65rem] font-bold">{discount}%</span>}
                          </div>
                        )}
                        <span className="font-['Syne'] text-base font-extrabold">{item.price.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Summary ── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 bg-[#141517] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="font-['Syne'] text-base font-extrabold mb-5">결제 금액</h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7D85]">선택 강의 ({selected.length}개)</span>
                  <span>{originalTotal.toLocaleString()}원</span>
                </div>
                {savedAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7A7D85]">할인 금액</span>
                    <span className="text-[#2ED573]">-{savedAmount.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t border-white/[0.07] pt-3 flex justify-between">
                  <span className="font-semibold">최종 결제 금액</span>
                  <span className="font-['Syne'] text-xl font-extrabold text-[#4F8EF7]">{total.toLocaleString()}원</span>
                </div>
              </div>

              {savedAmount > 0 && (
                <div className="bg-[#2ED573]/10 border border-[#2ED573]/20 rounded-xl px-4 py-2.5 mb-5">
                  <p className="text-[#2ED573] text-xs font-semibold text-center">
                    🎉 {savedAmount.toLocaleString()}원 절약!
                  </p>
                </div>
              )}

              <button
                disabled={selected.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] shadow-[0_6px_24px_rgba(79,142,247,0.3)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selected.length > 0 ? `${selected.length}개 강의 결제하기` : "강의를 선택해주세요"}
              </button>

              <Link to="/courses" className="block text-center text-xs text-[#7A7D85] hover:text-white transition-colors mt-4">
                강의 더 담기 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
