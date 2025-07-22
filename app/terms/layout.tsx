import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | CheetahType',
  description: 'Read the terms and conditions for using CheetahType. Our terms of service outline the rules, guidelines, and legal agreements between users and our typing test platform.',
  keywords: 'terms of service, terms and conditions, legal, user agreement, typing test, rules, guidelines',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
