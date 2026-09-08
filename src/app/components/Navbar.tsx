'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-transparent py-8 absolute top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center">
          <div className="font-display text-xl font-normal text-white tracking-widest">
            Altessimmo
          </div>
          <div className="hidden md:flex space-x-12">
              <Link href="/" className="text-white/60 hover:text-white transition-colors duration-500 font-light tracking-widest text-sm uppercase">
                Accueil
              </Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors duration-500 font-light tracking-widest text-sm uppercase">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
