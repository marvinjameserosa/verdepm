import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Background } from "@/components/ui/background";

export const metadata: Metadata = {
  title: "Terms of Service | VerdePM",
  description: "Terms of Service for VerdePM project management platform",
};

export default function TermsPage() {
  return (
    <Background className="flex min-h-screen items-center justify-center">
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="scale-110 sm:scale-125" />
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden">
            <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 text-center border-b border-gray-200/50 dark:border-gray-700/50">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Last updated: November 19, 2025
              </p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 space-y-8 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using VerdePM ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground mb-3">
                  Permission is granted to temporarily access and use the Service for personal or commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without authorization</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
                <p className="text-muted-foreground mb-3">
                  To access certain features of the Service, you must register for an account. When you register, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept all responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Project Data and Content</h2>
                <p className="text-muted-foreground">
                  You retain all rights to the project data and content you submit to VerdePM. By uploading content, you grant us a license to use, store, and process that content solely for the purpose of providing the Service to you. We do not claim ownership of your content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-3">
                  You may not access or use the Service for any purpose other than that for which we make the Service available. Prohibited activities include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                  <li>Transmitting malware, viruses, or harmful code</li>
                  <li>Engaging in unauthorized access or data scraping</li>
                  <li>Harassing, abusing, or harming other users</li>
                  <li>Impersonating another person or entity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. ESG Reporting and AI Features</h2>
                <p className="text-muted-foreground">
                  VerdePM provides AI-powered ESG (Environmental, Social, and Governance) reporting features. While we strive for accuracy, AI-generated reports should be reviewed and verified by qualified professionals. We do not guarantee the completeness or accuracy of AI-generated content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Service Modifications</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall VerdePM or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service, even if VerdePM or a VerdePM authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at legal@verdepm.com
                </p>
              </section>
            </div>
            <div className="pt-8 border-t text-center">
              <Link href="/login">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
