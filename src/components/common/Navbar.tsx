"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu,
  Search,
  ArrowUpRight,
  Sun,
  Moon,
  MessageCircle,
} from "lucide-react";
import { getGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { useTheme } from "./ThemeProvider";
import { useStorefrontCategories } from "./StorefrontCategoriesProvider";
import { Modal } from "./Modal";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const categories = useStorefrontCategories();
  const links = [
    { label: "All products", href: "/products", type: "" },
    { label: "Watches", href: "/products?productType=watch", type: "watch" },
    { label: "Shoes", href: "/products?productType=shoes", type: "shoes" },
    { label: "T-shirts", href: "/products?productType=tshirt", type: "tshirt" },
  ];
  const close = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };
  const submitSearch = (value: string) => {
    if (!value.trim()) return;
    router.push(`/products?search=${encodeURIComponent(value.trim())}`);
    close();
    setSearch("");
  };
  return (
    <>
      <header className="qt-header">
        <div className="qt-header-inner">
          <Link
            href="/"
            className="qt-wordmark"
            onClick={close}
            aria-label="Quartz Times home"
          >
            QUARTZ<span className="qt-wordmark-dot">.</span>
            <span className="qt-wordmark-second">TIMES</span>
          </Link>
          <nav className="qt-desktop-nav" aria-label="Main navigation">
            {links.map((link) => {
              const active =
                (pathname === "/products" &&
                  (searchParams.get("productType") || "") === link.type) ||
                (pathname === "/watches" && link.type === "watch");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "is-active" : ""}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            {!!categories.length && (
              <details className="qt-category-menu">
                <summary>Collections</summary>
                <div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${encodeURIComponent(cat.slug)}`}
                      onClick={(event) =>
                        event.currentTarget
                          .closest("details")
                          ?.removeAttribute("open")
                      }
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </nav>
          <div className="qt-header-actions">
            <button
              onClick={() => setSearchOpen(true)}
              className="qt-search-trigger"
              aria-label="Search products"
            >
              <Search size={20} />
              <span>Search</span>
            </button>
            <button
              onClick={toggleTheme}
              className="icon-button qt-header-theme"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/contact" className="qt-header-help">
              Get help <ArrowUpRight size={15} />
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="icon-button qt-menu-trigger"
              aria-label="Open navigation menu"
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
      </header>
      {searchOpen && (
        <Modal
          title="Find your next favourite."
          onClose={close}
          className="qt-search-dialog"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(search);
            }}
            className="qt-search-form"
          >
            <label htmlFor="site-search" className="sr-only">
              Search the collection
            </label>
            <Search size={22} />
            <input
              id="site-search"
              data-autofocus
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, brands and styles"
            />
            <button className="qt-button" disabled={!search.trim()}>
              Search
            </button>
          </form>
          <p className="qt-muted mt-8 mb-4 text-sm">Explore the collection</p>
          <div className="flex flex-wrap gap-3">
            {links.slice(1).map((link) => (
              <Link
                onClick={close}
                className="qt-pill"
                href={link.href}
                key={link.href}
              >
                {link.label}
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        </Modal>
      )}
      {menuOpen && (
        <Modal
          title="Explore Quartz Times"
          onClose={close}
          className="qt-menu-dialog"
        >
          <nav aria-label="Mobile navigation" className="qt-mobile-links">
            {links.map((link) => (
              <Link key={link.href} onClick={close} href={link.href}>
                {link.label}
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </nav>
          {!!categories.length && (
            <div className="qt-mobile-categories">
              <p className="qt-eyebrow">Collections</p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${encodeURIComponent(cat.slug)}`}
                  onClick={close}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <div className="qt-menu-bottom">
            <Link href="/about" onClick={close}>
              Our story
            </Link>
            <Link href="/contact" onClick={close}>
              Contact & help
            </Link>
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{" "}
              {theme === "dark" ? "Light" : "Dark"} appearance
            </button>
          </div>
          <a
            href={getGeneralWhatsAppUrl("Navigation")}
            target="_blank"
            rel="noopener noreferrer"
            className="qt-button qt-button-whatsapp mt-6"
          >
            <MessageCircle size={18} /> Talk to our team
          </a>
        </Modal>
      )}
    </>
  );
};
