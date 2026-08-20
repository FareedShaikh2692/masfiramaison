"use client";

import { waLink } from "@/lib/format";
import { WHATSAPP_GREETING } from "@/data/data";
import { useBusiness } from "@/components/BusinessContext";

export default function WhatsappFloat() {
  const business = useBusiness();
  return (
    <a
      href={waLink(WHATSAPP_GREETING, business)}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp"
      className="print:hidden fixed right-4 md:right-6 bottom-[92px] md:bottom-6 z-[790] w-[52px] h-[52px] md:w-[58px] md:h-[58px] rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(37,211,102,0.45)] hover:scale-105 transition-transform"
      style={{ background: "#25D366" }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.902 6.47L4 29l7.72-1.87A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3zm0 21.818a9.78 9.78 0 0 1-4.99-1.363l-.358-.213-4.583 1.11 1.127-4.47-.234-.367A9.78 9.78 0 0 1 6.182 15c0-5.421 4.398-9.818 9.819-9.818S25.818 9.579 25.818 15 21.422 24.818 16.001 24.818zm5.4-7.34c-.296-.148-1.752-.865-2.024-.964-.272-.099-.47-.148-.668.148-.198.296-.767.964-.94 1.163-.173.198-.347.223-.643.074-.296-.148-1.249-.46-2.379-1.467-.879-.784-1.473-1.753-1.646-2.05-.173-.297-.019-.457.13-.605.133-.132.297-.346.445-.52.148-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.074-.148-.668-1.611-.916-2.206-.241-.579-.487-.5-.668-.51-.173-.008-.371-.01-.569-.01-.198 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.478 0 1.463 1.065 2.876 1.213 3.074.148.198 2.096 3.2 5.078 4.488.71.307 1.263.49 1.694.627.712.227 1.36.195 1.872.118.571-.085 1.752-.716 1.999-1.408.247-.693.247-1.286.173-1.409-.074-.123-.272-.198-.569-.346z" />
      </svg>
    </a>
  );
}
