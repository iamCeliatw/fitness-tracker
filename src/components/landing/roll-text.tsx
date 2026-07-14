/**
 * Hover 文字上翻效果：兩份文字疊放，hover 時原文字上移出框、
 * 複本從下方翻入。父元素需有 `group` class；純 CSS，無 JS。
 */
export default function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
