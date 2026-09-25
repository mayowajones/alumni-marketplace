import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", phone: "", address: "", city: "", state: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // 1. Create the order in "unpaid" state — stock is reserved here.
      const { data: order } = await api.post("/orders", {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: form,
        paymentMethod: "paystack",
      });

      // 2. Ask our backend to open a Paystack transaction for this order.
      //    The amount is read from the order server-side — never sent by us.
      const { data: payment } = await api.post("/payments/initialize", {
        orderId: order._id,
      });

      // 3. Send the shopper to Paystack's hosted checkout page.
      //    Cart is cleared now since the order already exists server-side;
      //    Paystack will redirect back to /payment/verify on completion.
      clearCart();
      window.location.href = payment.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">Checkout</p>
        <h1 className="mt-3 text-3xl font-bold text-forest-dark">Complete your order</h1>
      </div>

      {error && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-[1.8rem] border border-forest/10 bg-white p-6 shadow-[0_25px_50px_rgba(17,32,24,0.08)] sm:grid sm:grid-cols-2 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-forest-dark/70">Full name</label>
            <input name="fullName" placeholder="Your full name" required onChange={handleChange}
              className="w-full rounded-xl border border-forest/15 bg-[#f7f2ea] px-4 py-3 text-forest-dark outline-none transition focus:border-gold" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-forest-dark/70">Phone number</label>
            <input name="phone" placeholder="0803 000 0000" required onChange={handleChange}
              className="w-full rounded-xl border border-forest/15 bg-[#f7f2ea] px-4 py-3 text-forest-dark outline-none transition focus:border-gold" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-forest-dark/70">City</label>
            <input name="city" placeholder="City" required onChange={handleChange}
              className="w-full rounded-xl border border-forest/15 bg-[#f7f2ea] px-4 py-3 text-forest-dark outline-none transition focus:border-gold" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-forest-dark/70">Delivery address</label>
            <input name="address" placeholder="Street address" required onChange={handleChange}
              className="w-full rounded-xl border border-forest/15 bg-[#f7f2ea] px-4 py-3 text-forest-dark outline-none transition focus:border-gold" />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-forest-dark/70">State</label>
            <input name="state" placeholder="State" required onChange={handleChange}
              className="w-full rounded-xl border border-forest/15 bg-[#f7f2ea] px-4 py-3 text-forest-dark outline-none transition focus:border-gold" />
          </div>

          <div className="sm:col-span-2 mt-4 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xl font-bold text-forest-dark">Total: {formatPrice(total)}</p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gold px-6 py-3.5 text-base font-bold text-forest-dark transition hover:bg-[#e9bd6f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing order…" : "Place order & pay"}
            </button>
          </div>
        </form>

        <aside className="rounded-[1.8rem] border border-forest/10 bg-[#112018] p-6 text-cream shadow-[0_25px_50px_rgba(17,32,24,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Payment</p>
          <h2 className="mt-3 text-2xl font-bold">Secure checkout</h2>
          <ul className="mt-6 space-y-3 text-sm text-cream/75">
            <li>• Secure payment flow via Paystack</li>
            <li>• Delivery details verified before order placement</li>
            <li>• Order confirmation sent after payment</li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
