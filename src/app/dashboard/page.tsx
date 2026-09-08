"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Home,
  LogOut,
  User,
  Building2,
  DollarSign,
  Shield,
  ChevronRight,
} from "lucide-react";
import ChangePasswordModal from "@/app/components/ChangePasswordModal";

interface Contact {
  id: string;
  type: "BUYER" | "SELLER";
  status:
    | "NEW"
    | "CONTACTED"
    | "INTERESTED"
    | "VIEWING"
    | "OFFER"
    | "SOLD"
    | "ARCHIVED";
}

export default function DashboardHubPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/auth/verify");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUser(data.admin);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    run();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const response = await fetch("/api/contacts");
        const data = (await response.json()) as Contact[];
        setContacts(Array.isArray(data) ? data : []);
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const logout = async () => {
    try {
      await fetch("/api/auth/verify", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const buyers = contacts.filter((c) => c.type === "BUYER");
  const sellers = contacts.filter((c) => c.type === "SELLER");
  const newContacts = contacts.filter((c) => c.status === "NEW");

  if (!isAuthenticated) {
    return (
      <div className="admin-light min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-light">
            Vérification de l&apos;authentification...
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-light min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-light">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-light min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 py-8"
      >
        <div className="max-w-7xl mx-auto px-0 md:px-8">
          <div className="flex justify-between items-start">
            <div>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-white/45 mb-4">
                <span className="text-white font-medium">Vue d&apos;ensemble</span>
                <span className="text-white/25" aria-hidden>
                  ·
                </span>
                <Link
                  href="/dashboard/acheteurs"
                  className="hover:text-white/80 transition-colors"
                >
                  Acheteurs
                </Link>
                <span className="text-white/25" aria-hidden>
                  ·
                </span>
                <Link
                  href="/dashboard/proprietaires"
                  className="hover:text-white/80 transition-colors"
                >
                  Propriétaires
                </Link>
              </nav>
              <h1 className="font-display text-3xl font-normal tracking-wide mb-2">
                Dashboard
              </h1>
              <p className="text-white/60 font-light">
                Vue d&apos;ensemble CRM — accédez aux listes dédiées
              </p>
            </div>
            <div className="flex items-center space-x-4 pt-1">
              <Link
                href="/dashboard/properties"
                className="hidden md:inline-flex items-center space-x-2 px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 rounded-sm"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Biens</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <div className="flex items-center space-x-2 text-white/60">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user?.username}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(true)}
                    className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
                  >
                    <div className="bg-black/90 border border-white/20 rounded-lg p-2 whitespace-nowrap hover:bg-black/95 hover:border-white/30 transition-all duration-200 cursor-pointer">
                      <span className="text-xs text-white/70">
                        Changer mot de passe
                      </span>
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 rounded-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden md:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-0 md:px-8 py-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-10">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">
                  Nouveaux contacts
                </p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {newContacts.length}
                </p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((newContacts.length / Math.max(contacts.length, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">
                  Acheteurs actifs
                </p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Home className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {buyers.filter((b) => b.status !== "ARCHIVED").length}
                </p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-500 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((buyers.filter((b) => b.status !== "ARCHIVED").length / Math.max(contacts.length, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">
                  Propriétaires actifs
                </p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Shield className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {sellers.filter((s) => s.status !== "ARCHIVED").length}
                </p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((sellers.filter((s) => s.status !== "ARCHIVED").length / Math.max(contacts.length, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">
                  Ventes conclues
                </p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-orange-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {contacts.filter((c) => c.status === "SOLD").length}
                </p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((contacts.filter((c) => c.status === "SOLD").length / Math.max(contacts.length, 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pb-16">
          <Link
            href="/dashboard/acheteurs"
            className="group block rounded-xl border border-white/15 bg-white/[0.03] p-8 hover:border-purple-400/35 hover:bg-white/[0.06] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/45 mb-2">
                  CRM
                </p>
                <h2 className="font-display text-2xl font-normal text-white mb-2">
                  Acheteurs
                </h2>
                <p className="text-white/55 text-sm leading-relaxed">
                  Tableau des prospects acheteurs, budgets, statuts et fiches
                  détail.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/35 group-hover:text-white/70 shrink-0 transition-colors" />
            </div>
          </Link>

          <Link
            href="/dashboard/proprietaires"
            className="group block rounded-xl border border-white/15 bg-white/[0.03] p-8 hover:border-green-400/35 hover:bg-white/[0.06] transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/45 mb-2">
                  CRM
                </p>
                <h2 className="font-display text-2xl font-normal text-white mb-2">
                  Propriétaires
                </h2>
                <p className="text-white/55 text-sm leading-relaxed">
                  Tableau des mandants / vendeurs, estimations et suivi.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/35 group-hover:text-white/70 shrink-0 transition-colors" />
            </div>
          </Link>
        </div>
      </motion.div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
