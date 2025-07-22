import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found - CheetahType',
  description: 'The page you are looking for does not exist. Return to CheetahType home page.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-teal-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" passHref>
          <Button>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 