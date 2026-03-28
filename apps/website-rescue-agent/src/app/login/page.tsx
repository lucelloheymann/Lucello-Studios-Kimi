"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-Mail oder Passwort falsch.");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Website Rescue Agent</h1>
            <p className="text-sm text-zinc-400 mt-1">Lucello Studio — Internes Tool</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-700 rounded-lg text-sm bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="name@lucellostudio.de"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-700 rounded-lg text-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-900 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
