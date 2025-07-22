import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CheetahType',
  description: 'Learn about how CheetahType collects, uses, and protects your personal information. Our privacy policy explains our data practices and your rights.',
  keywords: 'privacy policy, data protection, typing test, personal information, cookies, GDPR, privacy',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
