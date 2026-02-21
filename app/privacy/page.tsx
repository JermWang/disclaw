import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - DISCLAW",
  description: "DISCLAW privacy policy and data handling practices.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              DISCLAW collects minimal data necessary to provide our Discord bot services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
              <li>Discord server IDs where the bot is installed</li>
              <li>Channel IDs for autopost configuration</li>
              <li>User-configured policy settings</li>
              <li>Call logs and interaction history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <p className="text-gray-300 leading-relaxed">
              We use collected data solely to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
              <li>Provide and improve DISCLAW bot functionality</li>
              <li>Store your server configuration preferences</li>
              <li>Generate call logs and analytics</li>
              <li>Debug issues and improve service reliability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
            <p className="text-gray-300 leading-relaxed">
              Configuration data is stored securely and retained only as long as the bot remains 
              in your server. Upon bot removal, server-specific data is deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              DISCLAW integrates with the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
              <li><strong>Discord</strong> — Bot hosting and message delivery</li>
              <li><strong>DexScreener</strong> — Token price and trading data</li>
              <li><strong>Helius</strong> — On-chain holder data (Solana)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy-related inquiries, contact us on{" "}
              <a href="https://discord.gg/fBUBVaaHhF" className="text-[#5865F2] hover:underline">Discord</a>{" "}
              or via Twitter{" "}
              <a href="https://x.com/DisclawSOL" className="text-[#5865F2] hover:underline">@DisclawSOL</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
