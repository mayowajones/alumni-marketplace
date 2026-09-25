import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CartDrawer from "./CartDrawer.jsx";

const accountItems = [
  { label: "My Account", icon: "👤", href: "/login" },
  { label: "Orders", icon: "🧾", href: "/products" },
  { label: "Wishlist", icon: "💖", href: "/products" },
  { label: "Saved Items", icon: "📌", href: "/products" },
];

const helpItems = [
  { label: "Place an Order", icon: "🛒", href: "/products" },
  { label: "Track & Cancel Order", icon: "📦", href: "/products" },
  { label: "Payment Options", icon: "💳", href: "/products" },
  { label: "Returns & Refunds", icon: "↩️", href: "/products" },
  { label: "Cookies Reference", icon: "🍪", href: "/products" },
  { label: "Live Chat", icon: "💬", href: "https://wa.me/2348000000000?text=Hello%20I%20need%20support" },
  { label: "WhatsApp", icon: "📱", href: "https://wa.me/2348000000000?text=Hello%20I%20need%20help" },
];

const pageMenuItems = [
  { label: "Our story", slug: "our-story", type: "page" },
  { label: "Birthdays", slug: "birthdays", type: "page" },
  { label: "Our community", slug: "our-community", type: "page" },
  { label: "The gallery", slug: "gallery", type: "page" },
  { label: "Where are they now?", slug: "where-are-they-now", type: "page" },
  { label: "Forms & Documents", slug: "forms-documents", type: "page" },
  { label: "Always Commandos", slug: "always-commandos", type: "page" },
];

const categoryItems = [
  { label: "Cars", slug: "cars", type: "product" },
  { label: "Trucks", slug: "trucks", type: "product" },
  { label: "Electronics", slug: "electronics", type: "product" },
  { label: "Provision", slug: "provision", type: "product" },
  { label: "Wears", slug: "wears", type: "product" },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const accountRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const query = search.trim();
    navigate(query ? `/products?keyword=${encodeURIComponent(query)}` : "/products");
    setSearch("");
  };

  const handleCategoryClick = (item) => {
    if (item.type === "page") {
      navigate(`/${item.slug}`);
      return;
    }

    navigate(`/products?category=${encodeURIComponent(item.slug)}`);
  };

  const handleHelpAction = (href) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(href);
    }
    setIsHelpOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e8e8e8] bg-[#f5f5f5] text-[#222] shadow-sm">
        <div className="bg-[#0d372d] text-[#f2e9d8]">
          <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-3 px-4 py-2 text-[11px] font-medium">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2 font-semibold text-[#f2e9d8]">
                <span className="h-2 w-2 rounded-full bg-[#d6a04d]" />
                Command Day Secondary School, Ojo
              </span>
            </div>

            <div className="flex items-center gap-4 text-[#f2e9d8]">
              <span className="hidden sm:inline">One set. A lifetime of connection.</span>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto flex max-w-[1300px] items-center gap-3 px-4 py-3">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0d372d] bg-[#f2e9d8] text-[0.7rem] font-black text-[#0d372d]">
                O'98
              </div>
              <div className="leading-none">
                <div className="text-[1.05rem] font-black uppercase tracking-[0.08em] text-[#0d372d]">Command Ojo '98</div>
                <div className="mt-1 text-[0.54rem] font-bold uppercase tracking-[0.2em] text-[#0d372d]/75">Alumni Association</div>
              </div>
            </Link>

            <div className="relative ml-2 w-full max-w-[560px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search products, brands and categories"
                className="h-10 w-full rounded-xl border border-[#e6e6e6] bg-[#f8f8f8] pl-4 pr-24 text-sm text-[#222] outline-none transition focus:border-[#f68b1e] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1 h-8 rounded-lg bg-[#d6a04d] px-3.5 text-xs font-semibold text-[#0d372d] transition hover:bg-[#c99436]"
              >
                Search
              </button>
            </div>

            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  setIsAccountOpen((prev) => !prev);
                  setIsHelpOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-3 py-2 text-left transition hover:border-[#f68b1e] hover:bg-[#fff7f0]"
              >
                <span className="text-xl">👤</span>
                <span>
                  <span className="block text-[10px] font-medium text-[#666]">
                    {user ? `Hi, ${user.name?.split(" ")[0] || "User"}` : "Hi, customer"}
                  </span>
                  <span className="block text-sm font-bold text-[#222]">Account</span>
                </span>
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-xl border border-[#ececec] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-[#f0f0f0] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Account</p>
                    <p className="mt-2 text-sm font-semibold text-[#222]">
                      {user ? user.name : "Welcome back"}
                    </p>
                  </div>
                  <div className="p-2">
                    {accountItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#333] transition hover:bg-[#f8f8f8]"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    {user ? (
                      <button
                        onClick={() => {
                          logout();
                          setIsAccountOpen(false);
                        }}
                        className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#d92d20] transition hover:bg-[#fff5f5]"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsAccountOpen(false)}
                        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#0d372d] transition hover:bg-[#f6f1e8]"
                      >
                        <span>🔐</span>
                        <span>Login / Register</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={helpRef}>
              <button
                onClick={() => {
                  setIsHelpOpen((prev) => !prev);
                  setIsAccountOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-3 py-2 text-left transition hover:border-[#f68b1e] hover:bg-[#fff7f0]"
              >
                <span className="text-lg">❔</span>
                <span className="text-sm font-semibold text-[#222]">Help</span>
              </button>

              {isHelpOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-xl border border-[#ececec] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-[#f0f0f0] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#999]">Support</p>
                    <p className="mt-2 text-sm font-semibold text-[#222]">How can we help?</p>
                  </div>
                  <div className="p-2">
                    {helpItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleHelpAction(item.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#333] transition hover:bg-[#f8f8f8]"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] px-3 py-2 text-[#222] transition hover:border-[#d6a04d] hover:bg-[#fffaf1]"
              aria-label="Open cart"
            >
              <span className="text-xl">🛒</span>
              <span className="text-sm font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f68b1e] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <Link to="/admin" className="hidden rounded-xl border border-[#ebebeb] bg-[#f6f1e8] px-3 py-2 text-sm font-semibold text-[#0d372d] md:inline-flex">
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-[#e8dfd0] bg-[#f8f4ec]">
          <div className="mx-auto flex max-w-[1300px] justify-center gap-2 overflow-x-auto px-4 py-3 text-sm text-[#444]">
            {pageMenuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleCategoryClick(item)}
                className="whitespace-nowrap rounded-full border border-[#e6dcc7] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0d372d]/80 transition hover:border-[#d6a04d] hover:bg-[#fffaf1] hover:text-[#0d372d]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#f0f0f0] bg-white">
          <div className="mx-auto flex max-w-[1300px] items-center gap-2 overflow-x-auto px-4 py-3 text-sm text-[#444]">
            {categoryItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleCategoryClick(item)}
                className="whitespace-nowrap rounded-full border border-transparent bg-[#f6f3ee] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#0d372d]/75 transition hover:border-[#d6a04d]/50 hover:bg-[#f5efe5] hover:text-[#0d372d]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
