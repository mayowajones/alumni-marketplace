import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);

const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="rounded-[2rem] border border-forest/10 bg-white p-10 shadow-[0_25px_50px_rgba(17,32,24,0.06)]">
          <p className="mb-6 text-lg text-forest-dark/60">Your cart is empty.</p>
          <Link to="/products" className="inline-flex rounded-xl bg-gold px-6 py-3 font-bold text-forest-dark transition hover:bg-[#e9bd6f]">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">Cart</p>
        <h1 className="mt-3 text-3xl font-bold text-forest-dark">Your shopping bag</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product} className="flex flex-col gap-4 rounded-[1.5rem] border border-forest/10 bg-white p-4 shadow-[0_18px_32px_rgba(17,32,24,0.05)] sm:flex-row sm:items-center">
              <img src={item.image} alt={item.title} className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />

              <div className="flex-1">
                <p className="text-lg font-semibold text-forest-dark">{item.title}</p>
                <p className="mt-1 text-base font-bold text-forest-dark">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                <label className="text-sm text-forest-dark/60">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
                  className="w-16 rounded-lg border border-forest/15 bg-[#f7f2ea] px-2 py-2 text-center text-forest-dark outline-none focus:border-gold"
                />
                <button onClick={() => removeItem(item.product)} className="text-sm font-semibold text-red-600 transition hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[1.8rem] border border-forest/10 bg-white p-6 shadow-[0_25px_50px_rgba(17,32,24,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-dark">Summary</p>
          <div className="mt-5 space-y-3 text-sm text-forest-dark/70">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex items-center justify-between border-y border-forest/10 py-3">
              <span className="text-base font-semibold text-forest-dark">Total</span>
              <span className="text-xl font-bold text-forest-dark">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-xl bg-gold px-6 py-3.5 text-base font-bold text-forest-dark transition hover:bg-[#e9bd6f]"
          >
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
