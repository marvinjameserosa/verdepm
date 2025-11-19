import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Background } from "@/components/ui/background";

export const metadata: Metadata = {
  title: "Privacy Policy | VerdePM",
  description: "Privacy Policy for VerdePM project management platform",
};

export default function PrivacyPage() {
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
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Last updated: November 19, 2025
              </p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 space-y-8 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground">
                  VerdePM ("we", "our", or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our
                  project management platform. Please read this privacy policy
                  carefully.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">
                  We collect information that you provide directly to us,
                  including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
                  <li><strong>Project Data:</strong> Project details, construction phases, ESG metrics, and related documentation</li>
                  <li><strong>Communication Data:</strong> Messages, comments, and feedback you provide</li>
                  <li><strong>Payment Information:</strong> Billing details and transaction history (processed securely by third-party providers)</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative information, updates, and security alerts</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Generate ESG reports and analytics using AI technology</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues and security threats</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                <p className="text-muted-foreground mb-3">
                  We implement appropriate technical and organizational measures to
                  protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Data is encrypted in transit using SSL/TLS protocols</li>
                  <li>Data is encrypted at rest using industry-standard encryption</li>
                  <li>We use Supabase for secure database management and authentication</li>
                  <li>Access to personal data is restricted to authorized personnel only</li>
                  <li>Regular security audits and updates are performed</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  While we strive to protect your information, no method of
                  transmission over the Internet is 100% secure. We cannot guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground mb-3">
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>With your consent:</strong> When you authorize us to share specific information</li>
                  <li><strong>Team members:</strong> Project data is shared with invited team members within your workspace</li>
                  <li><strong>Service providers:</strong> Third-party vendors who perform services on our behalf (e.g., hosting, analytics, payment processing)</li>
                  <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
                  <li><strong>Protection:</strong> To protect the rights, property, or safety of VerdePM, our users, or others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. AI and Data Processing</h2>
                <p className="text-muted-foreground">
                  Our AI-powered ESG reporting features process your project data to
                  generate insights and reports. This processing is performed securely
                  and your data is not used to train AI models for other customers.
                  AI-generated content should be reviewed for accuracy and completeness.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
                <p className="text-muted-foreground mb-3">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information</li>
                  <li><strong>Withdraw consent:</strong> Withdraw previously given consent</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  To exercise these rights, please contact us at privacy@verdepm.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to
                  provide the Service and fulfill the purposes outlined in this Privacy
                  Policy. When you delete your account, we will delete or anonymize your
                  personal information within 90 days, except where we are required to
                  retain it for legal or regulatory purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground mb-3">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our Service</li>
                  <li>Provide personalized content and features</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  You can control cookies through your browser settings, but disabling
                  cookies may affect Service functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other
                  than your country of residence. We ensure that appropriate safeguards
                  are in place to protect your information in accordance with this Privacy
                  Policy and applicable laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify
                  you of any changes by posting the new Privacy Policy on this page.
                  You are advised to review this Privacy Policy periodically for any
                  changes. Changes to this Privacy Policy are effective when they are
                  posted on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
                <p className="text-muted-foreground">
                  This Privacy Policy is governed by and construed in accordance with
                  the laws of the jurisdiction in which VerdePM operates, without
                  regard to its conflict of law principles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground mb-2">
                  If you have questions or concerns about this Privacy Policy or our
                  privacy practices, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  Email: privacy@verdepm.com<br />
                  Address: VerdePM Privacy Team<br />
                  [Your Company Address]
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
