
import type { Metadata } from "next";
import "./globals.css";
import ScrollProgress from "./scroll-progress";

export const metadata: Metadata = {
    title: "Iya Elardo | IT Student Portfolio",
    description:
        "The portfolio of Iya Elardo, an Information Technology student exploring web development, interface design, and creative problem solving.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang= "en" >
        <body>
        <ScrollProgress />
    { children }
    </body>
        </html>
  );
}
