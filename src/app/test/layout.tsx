import "../globals.css";
import { fontVariables } from "@/lib/fonts";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}