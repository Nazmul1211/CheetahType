import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 flex items-center justify-center border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-yellow-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to CheetahType</span>
        </Link>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-6 text-lg">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            At CheetahType, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our typing test application.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account Information:</strong> If you create an account, we collect your username, email address, and password.</li>
            <li><strong>Usage Data:</strong> Information about your typing tests, including speed, accuracy, and test history.</li>
            <li><strong>Technical Data:</strong> IP address, device information, browser type, and operating system.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies to enhance your experience and collect information about how you use our application.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our service</li>
            <li>Process and complete your typing tests</li>
            <li>Track your progress and generate statistics</li>
            <li>Respond to your comments and questions</li>
            <li>Send you technical notices and updates</li>
            <li>Monitor usage patterns and analyze trends</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share your information in the following situations:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or in response to legal requests.</li>
            <li><strong>With Your Consent:</strong> We may share your information with your consent or at your direction.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Choices</h2>
          <p className="mb-4">
            You can control your information in the following ways:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account Information:</strong> You can update your account information in your profile settings.</li>
            <li><strong>Cookies:</strong> Most browsers allow you to control cookies through their settings preferences.</li>
            <li><strong>Marketing Communications:</strong> You can opt out of receiving promotional emails by following the instructions in those emails.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Security</h2>
          <p className="mb-4">
            We implement reasonable security measures to protect your personal information. However, no method of 
            transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the effective date.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-4">
            Email: privacy@CheetahType.com
          </p>
        </div>
      </main>
      
      <footer className="w-full p-4 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} CheetahType. All rights reserved.</p>
      </footer>
    </div>
  );
} 