import { MessageCircle } from "lucide-react";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";
export const WhatsAppBanner = () => (
  <section className="qt-help-banner">
    <p className="qt-eyebrow">Here when you need us</p>
    <h2>Your next find starts with a conversation.</h2>
    <p>
      Need a closer look, a size check or a second opinion? Talk directly with
      the Quartz Times team.
    </p>
    <a
      href={getGeneralWhatsAppUrl("Collection support")}
      target="_blank"
      rel="noopener noreferrer"
      className="qt-button qt-button-whatsapp mt-7"
    >
      <MessageCircle size={18} /> Chat on WhatsApp
    </a>
  </section>
);
