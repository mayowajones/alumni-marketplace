import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";

// Paystack redirects the shopper back to this page with ?reference=xxx
// after they complete (or cancel) payment on their hosted checkout.
const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setError("No payment reference found in the URL.");
      return;
    }

    api
      .get(`/payments/verify/${reference}`)
      .then(({ data }) => {
        setOrder(data.order);
        setStatus("success");
      })
      .catch((err) => {
        setStatus("failed");
        setError(err.response?.data?.message || "We could not verify this payment.");
      });
  }, [reference]);

  if (status === "verifying") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-forest-dark/60">Confirming your payment…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-forest-dark mb-3">Payment not confirmed</h1>
        <p className="text-forest-dark/60 mb-8">{error}</p>
        <Link to="/products" className="bg-gold text-forest-dark font-bold px-6 py-3 rounded">
          Back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-forest-dark mb-3">Payment successful</h1>
      <p className="text-forest-dark/60 mb-2">Order reference: <strong>{order?._id}</strong></p>
      <p className="text-forest-dark/60 mb-8">
        The seller has been notified and will process your order shortly.
      </p>
      <Link to="/products" className="bg-gold text-forest-dark font-bold px-6 py-3 rounded">
        Continue shopping
      </Link>
    </div>
  );
};

export default PaymentVerify;
