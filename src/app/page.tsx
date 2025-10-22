import { redirect } from "next/navigation";

export default function Home() {
  redirect('/fr'); // redirige vers la version française par défaut
}
