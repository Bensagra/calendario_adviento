import { HeartIcon } from "./icons";

export function CouponCard({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-dashed border-[#df8b8d] bg-gradient-to-br from-[#fffaf3] to-[#fce4df] px-7 py-10 text-center">
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8e9e4]" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#f8e9e4]" />
      <HeartIcon className="mx-auto h-8 w-8 text-[#c6535c]" />
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b1686d]">Cupón especial</p>
      <p className="font-display mx-auto mt-4 max-w-sm text-3xl font-semibold leading-tight text-[#59383d]">{text}</p>
      <div className="mx-auto mt-7 w-20 border-t border-[#d99b9d]" />
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b1686d]">Sin fecha de vencimiento</p>
    </div>
  );
}
