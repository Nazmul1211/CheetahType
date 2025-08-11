import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CheetahType',
  description: 'Get in touch with the CheetahType team. We\'re here to help with any questions or feedback about our typing test application.',
  keywords: 'contact, typing test, support, feedback, help, CheetahType',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}