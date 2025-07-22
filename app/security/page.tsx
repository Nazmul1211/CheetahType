import Link from 'next/link';
import { ArrowLeft, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 flex items-center border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-yellow-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to CheetahType</span>
        </Link>
      </header>

      <main className="flex-1 container max-w-4xl mx-auto p-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-10 w-10 text-green-500" />
          <h1 className="text-4xl font-bold">Security</h1>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-8">
            At CheetahType, we take the security of your data seriously. This page outlines our security practices and how you can help keep your account safe.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-semibold">Our Security Measures</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Secure password storage using industry-standard hashing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Regular security updates and audits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>HTTPS encryption for all data transmissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Protection against common web vulnerabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Limited data collection and secure storage</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="h-6 w-6 text-yellow-500" />
                <h2 className="text-xl font-semibold">Your Security Responsibilities</h2>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  <span>Create a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  <span>Never share your account credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  <span>Log out when using shared computers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  <span>Keep your email address up to date for account recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  <span>Report any suspicious activity to us immediately</span>
                </li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mt-10 mb-4">Reporting Security Issues</h2>
          <p className="mb-4">
            If you discover a security vulnerability or have concerns about the security of your account, 
            please contact us immediately at <a href="mailto:security@CheetahType.com" className="text-yellow-500 hover:underline">security@CheetahType.com</a>.
          </p>
          
          <h2 className="text-2xl font-semibold mt-10 mb-4">Data Protection</h2>
          <p className="mb-4">
            We store only the minimum amount of data necessary to provide our services. All sensitive data is encrypted 
            both in transit and at rest. For more information on how we handle your data, please review our 
            <Link href="/privacy" className="text-yellow-500 hover:underline ml-1">Privacy Policy</Link>.
          </p>
          
          <h2 className="text-2xl font-semibold mt-10 mb-4">Updates to Our Security Practices</h2>
          <p className="mb-4">
            We continuously monitor and improve our security practices. This page will be updated to reflect any 
            significant changes to our security measures.
          </p>
          
          <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Security Commitment</span>
            </h3>
            <p>
              CheetahType is committed to maintaining the highest standards of security to protect our users. 
              Security is not just a feature—it's a foundational aspect of our service.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="w-full p-4 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} CheetahType. All rights reserved.</p>
      </footer>
    </div>
  );
} 