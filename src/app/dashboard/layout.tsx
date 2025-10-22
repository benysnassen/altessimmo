import "../globals.css";
import Footer from "../components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}