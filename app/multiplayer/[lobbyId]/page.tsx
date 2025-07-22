import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Generate static params for the common demo lobby IDs
export function generateStaticParams() {
  return [
    { lobbyId: 'demo' },
    { lobbyId: 'example' },
    { lobbyId: 'test' },
  ];
}

export default function MultiplayerRacePage({ params }: { params: { lobbyId: string } }) {
  const lobbyId = params.lobbyId;

  return (
    <div className="container mx-auto py-10">
      <div className="flex mb-6">
        <Button asChild variant="outline" className="flex items-center gap-1">
          <Link href="/multiplayer">
            <ArrowLeft className="h-4 w-4" /> Back to Lobbies
          </Link>
        </Button>
      </div>
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-teal-400">
            Multiplayer Race
          </CardTitle>
          <CardDescription className="text-slate-400">
            Lobby ID: {lobbyId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="mb-4 text-slate-300">
              The multiplayer feature is currently under maintenance.
            </p>
            <p className="mb-8 text-slate-400">
              Please check back later for an improved multiplayer experience.
            </p>
            <Button asChild>
              <Link href="/">
                Return to Typing Test
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 