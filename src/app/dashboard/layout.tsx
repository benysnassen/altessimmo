import "../globals.css";
import Footer from "../components/Footer";
import { fontVariables } from "@/lib/fonts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}