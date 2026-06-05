import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthēon Outdoor | Design-led outdoor transformations",
  description:
    "Affordable luxury garden design and outdoor living concepts for modern homes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Anthēon Outdoor home">
            <Image
              alt=""
              aria-hidden="true"
              className="brand-mark"
              height={44}
              src="/images/brand/antheon-monogram.png"
              width={44}
            />
            <span>
              <strong>Anthēon</strong>
              <small>Outdoor</small>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/styles">Styles</Link>
            <Link href="/services">Services</Link>
            <Link href="/transformations">Transformations</Link>
            <Link href="/launch-projects">Launch Projects</Link>
            <Link href="/brief">Garden Brief</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <Link className="brand" href="/">
              <Image
                alt=""
                aria-hidden="true"
                className="brand-mark"
                height={44}
                src="/images/brand/antheon-monogram.png"
                width={44}
              />
              <span>
                <strong>Anthēon</strong>
                <small>Outdoor</small>
              </span>
            </Link>
            <p>
              Design-led outdoor transformations for modern homes, shaped with
              clarity, restraint and atmosphere.
            </p>
          </div>
          <div className="footer-links">
            <Link href="/transformations">Transformations</Link>
            <Link href="/admin/login">Admin login</Link>
            <Link href="/brief">Start your brief</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
