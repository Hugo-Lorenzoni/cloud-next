import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import Nav from "@/components/Nav";

const raleway = Raleway({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Cloud Project",
  description: "A project for the Cloud & Edge Computing course",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={raleway.className}>
        <Nav />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
