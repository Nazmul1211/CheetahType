"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClientJoinForm() {
  const [lobbyId, setLobbyId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyId.trim()) {
      window.location.href = `/multiplayer/${lobbyId.trim()}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lobby-id" className="text-slate-300">
          Lobby Code
        </Label>
        <Input
          id="lobby-id"
          placeholder="Enter lobby code"
          value={lobbyId}
          onChange={(e) => setLobbyId(e.target.value)}
          className="bg-slate-700 border-slate-600 text-slate-200"
        />
      </div>
      <Button type="submit" className="w-full">
        Join Race
      </Button>
    </form>
  );
} 