import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LandingNav from "@/components/landing/landing-nav";
import HeroMock from "@/components/landing/hero-mock";
import Reveal from "@/components/landing/reveal";
import RoleCircles from "@/components/landing/role-circles";
import RollText from "@/components/landing/roll-text";
import StickyFeatures from "@/components/landing/sticky-features";

export default async function LandingPage() {
  // ponytail: POC smoke-test — remove once strings are wired per task 3.x
  await getTranslations("common");
  return (
    <>
      <LandingNav />
      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-6 pt-36 pb-24 text-center">
          {/* 氛圍背景：頂部橘色光暈 + 向下漸淡的網格 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-40 left-1/2 h-96 w-[48rem] max-w-full -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)]" />
          </div>
          <p className="relative text-sm font-semibold tracking-[0.2em] text-orange-500 uppercase motion-safe:animate-[rise_0.6s_ease-out_both]">
            Track. Train. Transform.
          </p>
          <h1 className="relative mx-auto mt-4 max-w-3xl text-4xl leading-tight font-black tracking-tight sm:text-6xl">
            <span className="block overflow-hidden">
              <span className="block bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent motion-safe:animate-[rise-full_0.8s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]">
                把每一組訓練，
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent motion-safe:animate-[rise-full_0.8s_cubic-bezier(0.22,1,0.36,1)_0.25s_both]">
                都變成看得見的進步
              </span>
            </span>
          </h1>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-gray-400 motion-safe:animate-[rise_0.7s_ease-out_0.4s_both]">
            LIFTLOG 幫你記錄重訓、追蹤體重趨勢、預約教練課程——
            從第一組臥推到教練回饋，全部在同一個地方。
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 motion-safe:animate-[rise_0.7s_ease-out_0.5s_both] sm:flex-row">
            <Link
              href="/register"
              className="group w-full rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:bg-orange-400 hover:shadow-orange-500/40 sm:w-auto"
            >
              <RollText>免費開始</RollText>
            </Link>
            <Link
              href="/login"
              className="group w-full rounded-full border border-gray-700 px-8 py-3 text-base font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white sm:w-auto"
            >
              <RollText>登入</RollText>
            </Link>
          </div>
          <div className="relative mt-16 motion-safe:animate-[rise_0.8s_ease-out_0.65s_both]">
            <HeroMock />
          </div>
        </section>

        {/* 功能介紹 */}
        <section id="features" className="scroll-mt-20">
          <div
            aria-hidden
            className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-gray-800 to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
                訓練路上需要的，都在這裡
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
                從個人訓練記錄到教練協作，一套流程走完。
              </p>
            </Reveal>
            <StickyFeatures />
          </div>
        </section>

        {/* 三種角色 */}
        <section id="roles" className="scroll-mt-20 overflow-x-clip">
          <div
            aria-hidden
            className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-gray-800 to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
                一個平台，三種視角
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
                學員、教練、管理員各自有量身打造的工作流程。
              </p>
            </Reveal>
            <RoleCircles />
          </div>
        </section>

        {/* CTA Banner */}
        <section id="cta" className="scroll-mt-20">
          <div
            aria-hidden
            className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-gray-800 to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-6 py-20 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div
                  aria-hidden
                  className="absolute -top-32 left-1/2 h-64 w-[32rem] max-w-full -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000,transparent)]"
                />
                <h2 className="relative bg-gradient-to-b from-white to-gray-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
                  今天的訓練，現在就開始記錄
                </h2>
                <p className="relative mx-auto mt-4 max-w-md text-gray-400">
                  免費註冊，一分鐘內寫下你的第一筆訓練。
                </p>
                <Link
                  href="/register"
                  className="group relative mt-8 inline-block rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
                >
                  <RollText>免費開始</RollText>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer>
        <div
          aria-hidden
          className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-gray-800 to-transparent"
        />
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <p className="text-sm font-black tracking-tight text-white">
            LIFT<span className="text-orange-500">LOG</span>
            <span className="ml-3 font-normal text-gray-500">
              © 2026 Track. Train. Transform.
            </span>
          </p>
          <p className="text-xs text-gray-600">
            Next.js 16 · Supabase · Prisma · Tailwind CSS
          </p>
        </div>
      </footer>
    </>
  );
}
