"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function TermsPage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full p-4 flex items-center border-b border-border">
        <Link href="/" className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to CheetahType</span>
        </Link>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using CheetahType, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, you should not use this service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            CheetahType provides a platform for users to practice and improve their typing speed and accuracy.
            We reserve the right to modify or discontinue the service at any time without notice.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            Some features of CheetahType may require you to create an account. You are responsible for
            maintaining the security of your account and password. You agree to accept responsibility for
            all activities that occur under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p className="mb-4">
            You agree not to use CheetahType to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Attempt to gain unauthorized access to the service or its related systems</li>
            <li>Interfere with the proper functioning of the service</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p className="mb-4">
            The content, features, and functionality of CheetahType are owned by us and are protected by
            copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disclaimer of Warranties</h2>
          <p className="mb-4">
            CheetahType is provided &quot;as is&quot; without warranties of any kind, whether express or implied.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall CheetahType be liable for any damages arising out of the use or inability
            to use our service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Your continued use of CheetahType
            after such changes constitutes your acceptance of the new terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at support@CheetahType.com.
          </p>
        </div>
      </main>
    </div>
  );
} 