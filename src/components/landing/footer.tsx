import { EdgemakersLogo } from "@/components/edgemakers-logo";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  // Company address for Google Maps
  const companyAddress =
    "EDGEMAKERS Multisolutions, Mumbai, Maharashtra, India";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    companyAddress
  )}`;

  return (
    <footer className="w-full bg-gray-100 p-4 sm:p-6 md:py-12">
      <div className="container grid max-w-7xl gap-6 sm:gap-8 text-sm mx-auto px-4 sm:px-6 md:px-8">
        {/* Company Info */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-1 sm:col-span-2 grid gap-3 sm:gap-4">
            <div className="flex items-center">
              <EdgemakersLogo className="h-5 sm:h-6 w-auto text-primary" />
              <span className="ml-2 font-headline text-base sm:text-lg font-semibold text-foreground">
                EDGEMAKERS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pioneering innovative solutions for a competitive edge.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                <span>
                  EDGEMAKERS Multisolutions, Mumbai, Maharashtra, India
                </span>
              </a>
              <a
                href="tel:+919272005595"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4 text-accent" />
                <span>+91 92720 05595</span>
              </a>
              <a
                href="mailto:dkajale1182@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4 text-accent" />
                <span>dkajale1182@gmail.com</span>
              </a>
            </div>
          </div>

          <div className="grid gap-1">
            <h3 className="font-semibold text-foreground/90 mb-1 sm:mb-2 text-sm sm:text-base">
              Company
            </h3>
            <Link
              href="/about"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              About Us
            </Link>
            <Link
              href="/careers"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Careers
            </Link>
            <Link
              href="/#contact"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Contact
            </Link>
          </div>

          <div className="grid gap-1">
            <h3 className="font-semibold text-foreground/90 mb-1 sm:mb-2 text-sm sm:text-base">
              Services
            </h3>
            <Link
              href="/#services"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              House Keeping
            </Link>
            <Link
              href="/#services"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Technical Support
            </Link>
            <Link
              href="/#services"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Landscaping
            </Link>
          </div>

          <div className="grid gap-1">
            <h3 className="font-semibold text-foreground/90 mb-1 sm:mb-2 text-sm sm:text-base">
              Legal
            </h3>
            <Link
              href="#"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="container mt-6 sm:mt-8 max-w-7xl border-t border-border/50 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground px-4">
        © {new Date().getFullYear()} EDGEMAKERS Multisolutions. All rights
        reserved.
      </div>
    </footer>
  );
}
