/**
 * Hero 區的產品示意 UI（純 JSX，非截圖）：
 * 模擬 dashboard 的統計卡 + 體重折線圖 + 最近訓練列表。
 */
export default function HeroMock() {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* 橘色暖光暈 */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-[2rem] bg-orange-500/15 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/80 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.5)] sm:p-6">
        {/* 統計卡列 */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "本週訓練", value: "4 次" },
            { label: "目前體重", value: "72.4 kg" },
            { label: "本週總容量", value: "12,480 kg" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-800 bg-gray-950/60 p-3"
            >
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="mt-1 text-sm font-bold text-white sm:text-lg">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-5">
          {/* 體重趨勢折線示意 */}
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3 sm:col-span-3">
            <p className="text-xs text-gray-500">體重趨勢（30 天）</p>
            <svg
              viewBox="0 0 300 120"
              className="mt-2 h-28 w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[30, 60, 90].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="300"
                  y2={y}
                  stroke="#1f2937"
                  strokeWidth="1"
                />
              ))}
              <path
                d="M0,46 C30,42 45,58 75,54 C105,50 120,34 150,40 C180,46 195,66 225,62 C255,58 270,72 300,68 L300,120 L0,120 Z"
                fill="url(#hero-fill)"
              />
              <path
                d="M0,46 C30,42 45,58 75,54 C105,50 120,34 150,40 C180,46 195,66 225,62 C255,58 270,72 300,68"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 最近訓練列表示意 */}
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3 sm:col-span-2">
            <p className="text-xs text-gray-500">最近訓練</p>
            <ul className="mt-2 space-y-2">
              {[
                { name: "胸推日", detail: "5 動作・18 組" },
                { name: "背肌日", detail: "6 動作・20 組" },
                { name: "腿日", detail: "5 動作・16 組" },
              ].map((w) => (
                <li
                  key={w.name}
                  className="flex items-center justify-between rounded-md border border-gray-800/60 bg-gray-900/60 px-3 py-2"
                >
                  <span className="text-xs font-medium text-gray-200">
                    {w.name}
                  </span>
                  <span className="text-[10px] text-gray-500">{w.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
