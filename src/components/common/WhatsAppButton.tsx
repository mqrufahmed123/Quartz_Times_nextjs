"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { Modal } from "./Modal";
export const WhatsAppFloatingButton = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Product browsing already has contextual inquiry actions.
  if (
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/watches" ||
    pathname.startsWith("/categories/")
  )
    return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Chat with Quartz Times"
        className="fixed bottom-5 right-5 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-[#176b42] text-white shadow-lg"
      >
        <MessageCircle size={22} />
      </button>
      {open && (
        <Modal title="A little help choosing?" onClose={() => setOpen(false)}>
          <p className="qt-muted text-sm leading-7 mb-7">
            Ask our team about product details, sizing, more photos or delivery.
            We’re here Monday–Saturday, 10 am–8 pm IST.
          </p>
          <a
            href={getGeneralWhatsAppUrl("Personal assistance")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="qt-button qt-button-whatsapp"
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </Modal>
      )}
    </>
  );
};
