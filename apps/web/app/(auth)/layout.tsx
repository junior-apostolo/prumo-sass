import Link from "next/link";

function PrumoIcon() {
  return (
    <svg width="20" height="24" viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
      <circle cx="11" cy="13" r="1.6" fill="#fff" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white px-4 py-12 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-[-160px] left-[-200px] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 35% 35%,#BBD2FF,#E7F0FF 60%,rgba(231,240,255,0) 72%)",
          filter: "blur(8px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-180px] right-[-220px] w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 60% 60%,#A9C6FF,#E7F0FF 58%,rgba(231,240,255,0) 72%)",
          filter: "blur(8px)",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <Link href="/" className="flex flex-col items-center gap-2.5 mb-8 no-underline">
          <div className="flex items-center gap-2">
            <PrumoIcon />
            <span className="font-newsreader text-[24px] font-semibold tracking-[-0.01em] text-[#0B1220]">
              PRUMO
            </span>
          </div>
          <p className="text-[13.5px] text-[#7C8AA0]">Gestão de obras profissional</p>
        </Link>

        <div className="bg-white border border-[#E6ECF7] rounded-[20px] shadow-[0_20px_60px_rgba(20,50,120,0.10)] p-7 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
