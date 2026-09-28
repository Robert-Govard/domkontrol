/** Рамка телефона на десктопе; на мобильном — во весь экран. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-full sm:h-[800px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-[3rem] sm:border sm:border-line sm:bg-canvas sm:p-2.5 sm:shadow-[0_40px_80px_-24px_rgb(11_11_18/0.25)]">
      <div className="relative h-full overflow-hidden sm:rounded-[2.5rem] sm:border sm:border-line">
        <div className="absolute left-1/2 top-2.5 z-10 hidden h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-ink sm:block" aria-hidden />
        <div className="h-full sm:pt-10 sm:bg-canvas">{children}</div>
      </div>
    </div>
  );
}
