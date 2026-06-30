import type { Metadata } from "next";
import "./globals.css";
import { registerDefaultEventListeners } from "@/lib/events/listeners";

registerDefaultEventListeners();

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ATLAS — Premium Commerce", template: "%s | ATLAS" },
  description: "Curated, premium products with a fast, secure checkout.",
  openGraph: { type: "website", siteName: "ATLAS", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

import { ThemeService } from "@/lib/services/ThemeService";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await ThemeService.getTheme();
  const colors = (theme.colors as any) || { primary: "#C4973A", secondary: "#0A0A09", background: "#F4F3F0", foreground: "#0E0E0D" };
  const typography = (theme.typography as any) || { fontSans: "Inter, system-ui, sans-serif" };
  const layout = (theme.layout as any) || { borderRadius: "12px", containerWidth: "1200px" };

  const themeStyle = {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-background": colors.background,
    "--color-foreground": colors.foreground,
    "--font-sans": typography.fontSans,
    "--border-radius-theme": layout.borderRadius,
    "--container-width-theme": layout.containerWidth,
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body style={themeStyle}>
        {children}
      </body>
    </html>
  );
}
