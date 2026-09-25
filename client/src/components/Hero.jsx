import React from "react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="bg-[#f5f5f5] py-5">
    <div className="mx-auto max-w-[1300px] px-4">
      <div
        className="relative overflow-hidden rounded-[18px] border border-[#0d372d]/10 shadow-[0_14px_28px_rgba(13,55,45,0.1)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(10,54,45,0.92) 0%, rgba(10,54,45,0.90) 42%, rgba(245,245,245,0.28) 100%), url('https://images.unsplash.com/photo-1719532520316-4cc0d8886ab7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bG9jYWwlMjBiYWdzJTIwb2YlMjB0aWNlfGVufDB8fDB8fHww')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid min-h-[500px] items-center gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex max-w-[620px] flex-col justify-center">
            <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-[#d6a04d]">
              The class of 1998
            </p>

            <h1 className="font-serif text-[3.3rem] leading-[0.9] tracking-[-0.06em] text-[#f7efe3] md:text-[5.7rem]">
              Different paths.
              <br />
              One <span className="text-[#d6a04d]">Command.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#f7efe3]/85 md:text-[1.18rem]">
              From the classrooms of Ojo to wherever life has taken us. A home for old friends,
              shared memories, and the bond that still brings us together.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex w-fit items-center gap-3 rounded-xl bg-[#d6a04d] px-6 py-3.5 text-base font-bold text-[#0d372d] shadow-[0_12px_24px_rgba(214,160,77,0.3)] transition hover:bg-[#c79435]"
            >
              Rediscover the connection
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="relative hidden h-full min-h-[420px] items-end justify-center lg:flex">
            <div className="absolute inset-x-16 bottom-0 h-[65%] rounded-t-[22px] bg-[#f1e8d9]/15 backdrop-blur-[1px]" />
            <div className="relative z-10 flex h-[420px] w-full max-w-[540px] items-end justify-center">
              <div className="absolute bottom-0 left-5 h-[78%] w-[62%] rounded-t-[28px] border border-white/20 bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm" />
              <div className="absolute bottom-0 right-0 h-[82%] w-[68%] rounded-t-[28px] border border-white/20 bg-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm" />
              <div className="absolute bottom-0 left-10 right-10 h-[18%] rounded-t-[18px] bg-[#f5c76a]/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
