"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  // WhatsApp business number - AGM Mr. Dyaneshwar Kajle
  const whatsappNumber = "919272005595";
  const message =
    "Hello! I'm interested in learning more about EDGEMAKERS Multisolutions services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <Button
        asChild
        size="lg"
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#25D366] p-0 shadow-2xl transition-all duration-300 hover:bg-[#20BA5A] hover:scale-110"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </a>
      </Button>

      {isHovered && (
        <div className="absolute bottom-14 sm:bottom-16 right-0 mb-2 whitespace-nowrap rounded-lg bg-background border-2 border-primary/20 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2 hidden sm:block">
          Chat with us on WhatsApp
        </div>
      )}
    </div>
  );
}
