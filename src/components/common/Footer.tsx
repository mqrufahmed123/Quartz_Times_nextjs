"use client";
import Link from "next/link";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { useTheme } from "./ThemeProvider";
import { useStorefrontCategories } from "./StorefrontCategoriesProvider";

export const Footer = () => {
  const { theme, toggleTheme } = useTheme();
  const categories = useStorefrontCategories();
  return (
    <footer className="qt-footer">
      <div className="qt-container">
        <div className="qt-footer-main">
          <div>
            <Link href="/" className="qt-wordmark">
              QUARTZ<span className="qt-wordmark-dot">.</span>
              <span className="qt-wordmark-second">TIMES</span>
            </Link>
            <p className="qt-muted mt-5 max-w-xs text-sm leading-7">
              Watches, shoes and everyday favourites.
              <br />
              Selected with care. Made yours.
            </p>
            <a
              className="qt-text-link mt-5"
              href={getGeneralWhatsAppUrl("Footer")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Let’s talk on WhatsApp <ArrowUpRight size={16} />
            </a>
          </div>
          <div>
            <h2>Explore</h2>
            <Link href="/products">All products</Link>
            <Link href="/products?productType=watch">Watches</Link>
            <Link href="/products?productType=shoes">Shoes</Link>
            <Link href="/products?productType=tshirt">T-shirts</Link>
          </div>
          <div>
            <h2>Collections</h2>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${encodeURIComponent(cat.slug)}`}
              >
                {cat.name}
              </Link>
            ))}
            {!categories.length && (
              <Link href="/products?sort=newest">Latest arrivals</Link>
            )}
          </div>
          <div>
            <h2>Here to help</h2>
            <Link href="/contact">Contact us</Link>
            <Link href="/about">Our story</Link>
            <Link href="/about#quality">Our approach</Link>
            <Link href="/admin">Admin access</Link>
          </div>
        </div>
        <div className="qt-footer-bottom">
          <p>© {new Date().getFullYear()} Quartz Times. All rights reserved.</p>
          <div>
            <span>India · INR ₹</span>
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{" "}
              {theme === "dark" ? "Light" : "Dark"} mode
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
