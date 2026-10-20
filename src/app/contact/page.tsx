import { Metadata } from "next";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import {
  getGeneralWhatsAppUrl,
  getFormattedWhatsAppDisplay,
} from "@/lib/whatsapp";
import { DirectInquiryForm } from "@/components/product/DirectInquiryForm";
export const metadata: Metadata = {
  title: "Contact & help",
  description:
    "Talk to Quartz Times about product details, sizing, availability and delivery. Message us on WhatsApp or send an inquiry.",
};
export default function ContactPage() {
  return (
    <div className="qt-container">
      <header className="qt-page-heading">
        <p className="qt-eyebrow">A real person. A helpful answer.</p>
        <h1>Let’s talk.</h1>
        <p>
          Finding the right fit, exploring the details, or asking what comes
          next. We’re here to help you feel confident in your choice.
        </p>
      </header>
      <div className="qt-contact-grid">
        <div>
          <section className="qt-contact-card">
            <h2>A conversation, made easy.</h2>
            <p>
              For product photos, videos, availability and sizing advice, reach
              us directly on WhatsApp.
            </p>
            <a
              href={getGeneralWhatsAppUrl("Contact Page")}
              target="_blank"
              rel="noopener noreferrer"
              className="qt-button qt-button-whatsapp mt-6"
            >
              <MessageCircle size={18} /> Chat on WhatsApp{" "}
              <ArrowUpRight size={16} />
            </a>
            <p className="mt-4">{getFormattedWhatsAppDisplay()}</p>
          </section>
          <section className="qt-contact-card">
            <h2>When we’re here</h2>
            <p>
              Monday–Saturday
              <br />
              10:00 am–8:00 pm IST
            </p>
            <p className="mt-3">
              Send a message anytime. We’ll get back to you during support
              hours.
            </p>
          </section>
          <section className="qt-contact-card">
            <h2>Delivery questions?</h2>
            <p>
              Share the product you’re interested in and your delivery city. Our
              team can confirm availability, shipping options and the next
              steps.
            </p>
          </section>
        </div>
        <DirectInquiryForm />
      </div>
    </div>
  );
}
