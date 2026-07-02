import Link from "next/link";
import { ClipboardList, LineChart, Users } from "lucide-react";
import LandingNav from "@/components/landing/landing-nav";
import HeroMock from "@/components/landing/hero-mock";
import Reveal from "@/components/landing/reveal";
import { features } from "@/components/landing/features-data";

const roles = [
  {
    icon: ClipboardList,
    name: "學員",
    scenario:
      "記錄每次訓練與體重變化，瀏覽教練時段一鍵預約，所有進步都有數據佐證。",
  },
  {
    icon: Users,
    name: "教練",
    scenario:
      "一眼掌握學員本週訓練進度，管理自己的開放時段與本週行程。",
  },
  {
    icon: LineChart,
    name: "管理員",
    scenario:
      "設定組織預約規則，透過稽核紀錄追蹤平台上的每一筆關鍵操作。",
  },
];

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-36 pb-24 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-orange-500 uppercase">
            Track. Train. Transform.
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight font-black tracking-tight text-balance sm:text-6xl">
            把每一組訓練，
            <br className="hidden sm:block" />
            都變成看得見的進步
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
            LIFTLOG 幫你記錄重訓、追蹤體重趨勢、預約教練課程——
            從第一組臥推到教練回饋，全部在同一個地方。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-400 sm:w-auto"
            >
              免費開始
            </Link>
            <Link
              href="/login"
              className="w-full rounded-full border border-gray-700 px-8 py-3 text-base font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white sm:w-auto"
            >
              登入
            </Link>
          </div>
          <div className="mt-16">
            <HeroMock />
          </div>
        </section>

        {/* 功能介紹 */}
        <section id="features" className="scroll-mt-20 border-t border-gray-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
                訓練路上需要的，都在這裡
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
                從個人訓練記錄到教練協作，一套流程走完。
              </p>
            </Reveal>
            <div className="mt-14 grid gap-4 md:grid-cols-5">
              {features.map((feature, i) => (
                <Reveal
                  key={feature.title}
                  delay={i * 75}
                  className={
                    feature.span === "wide" ? "md:col-span-3" : "md:col-span-2"
                  }
                >
                  <div className="flex h-full flex-col rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors duration-150 hover:border-orange-500/40">
                    <feature.visual />
                    <h3 className="mt-4 text-lg font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 三種角色 */}
        <section id="roles" className="scroll-mt-20 border-t border-gray-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
                一個平台，三種視角
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-center text-gray-400">
                學員、教練、管理員各自有量身打造的工作流程。
              </p>
            </Reveal>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {roles.map((role, i) => (
                <Reveal key={role.name} delay={i * 75}>
                  <div className="h-full rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors duration-150 hover:border-orange-500/40">
                    <div className="flex items-center gap-3">
                      <role.icon className="h-6 w-6 text-orange-500" />
                      <h3 className="text-lg font-bold text-white">
                        {role.name}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">
                      {role.scenario}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section id="cta" className="scroll-mt-20 border-t border-gray-900">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
                <div
                  aria-hidden
                  className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl"
                />
                <h2 className="relative text-3xl font-black tracking-tight sm:text-4xl">
                  今天的訓練，現在就開始記錄
                </h2>
                <p className="relative mx-auto mt-4 max-w-md text-gray-400">
                  免費註冊，一分鐘內寫下你的第一筆訓練。
                </p>
                <Link
                  href="/register"
                  className="relative mt-8 inline-block rounded-full bg-orange-500 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  免費開始
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900">
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
