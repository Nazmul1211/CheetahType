import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy | CheetahType',
  description: 'Learn about CheetahType\'s security practices and how we protect your data. Our security policy outlines our commitment to keeping your information safe.',
  keywords: 'security policy, data security, typing test, information security, cybersecurity, data protection',
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}