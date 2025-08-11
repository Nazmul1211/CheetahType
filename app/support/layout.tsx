import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support | CheetahType',
  description: 'Get help with CheetahType. Find answers to common questions, troubleshooting tips, and ways to contact our support team.',
  keywords: 'support, help, typing test, troubleshooting, FAQ, customer service, assistance',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}