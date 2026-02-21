import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - DISCLAW",
  description: "DISCLAW terms of service and usage guidelines.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2025</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By adding DISCLAW to your Discord server or using any of our services, you agree 
              to be bound by these Terms of Service. If you do not agree to these terms, please 
              do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p className="text-gray-300 leading-relaxed">
              DISCLAW is a Discord bot that provides automated token analysis, whale wallet tracking, and signal calling 
              for Solana tokens. The service monitors PumpFun graduations and provides scoring 
              based on on-chain data and market metrics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">No Financial Advice</h2>
            <p className="text-gray-300 leading-relaxed bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
              <strong className="text-amber-400">Important:</strong> DISCLAW is a data aggregation 
              and analysis tool only. Nothing provided by DISCLAW constitutes financial advice, 
              investment advice, trading advice, or any other sort of advice. You should not treat 
              any of the content as such. Always do your own research (DYOR) before making any 
              investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
              <li>Use DISCLAW for any illegal purposes</li>
              <li>Attempt to manipulate or abuse the scoring system</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Resell or redistribute DISCLAW data without permission</li>
              <li>Use automated systems to overwhelm our API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              DISCLAW and its operators shall not be liable for any financial losses incurred 
              through the use of our service. Cryptocurrency trading carries significant risk, 
              and you acknowledge that you use DISCLAW at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            <p className="text-gray-300 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted service. 
              DISCLAW may be temporarily unavailable for maintenance, updates, or due to 
              circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of DISCLAW 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about these terms can be directed to us on{" "}
              <a href="https://discord.gg/fBUBVaaHhF" className="text-[#5865F2] hover:underline">Discord</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
