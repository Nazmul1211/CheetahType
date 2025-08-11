## Multiplayer Implementation Plan

### Goals
- Real-time races for 2–10 players per lobby
- Host-configurable settings (mode, time/words, custom text)
- Live progress (WPM, accuracy, position)
- Anti-cheat heuristics and fair results
- Persist results to Supabase and reflect on leaderboard

### Architecture
- Transport: Supabase Realtime (Postgres replication via websockets) or a dedicated WebSocket server (e.g., Next.js Route Handler + ws). Start with Supabase Realtime for speed.
- State model: store authoritative race state in `multiplayer_lobbies` and `multiplayer_players`; ephemeral progress in a channel topic (not persisted each keystroke).

### DB
- Tables already outlined in README (multiplayer_lobbies, multiplayer_players, multiplayer_results).
- RLS: only players in a lobby can read its full state; public can see completed summarized results.

### Realtime Channels
- Channel: `lobby:{lobby_id}`
- Events:
  - host:created, player:joined, player:left
  - host:started(settings), host:cancelled
  - player:progress({ user_id, chars, wpm, accuracy, ts }) throttled to ~4 Hz
  - system:finished({ user_id, placement })

### Client Flow
1. Create Lobby
   - Host hits /multiplayer page, clicks Create Lobby -> insert lobby row, join channel as host.
   - Share invite link `/multiplayer/{lobby_id}`.
2. Join Lobby
   - Player opens link, upsert into `multiplayer_players`, subscribe to `lobby:{id}`.
3. Start Race
   - Host presses Start -> broadcast settings, start countdown (3..2..1..Go!).
   - All clients locally start timers simultaneously.
4. Progress
   - Each client sends throttled progress events (chars typed, wpm, accuracy).
   - UI renders leaderboard with positions and deltas.
5. Finish
   - On finish or time end, client sends final stats; server (or host) validates and inserts `multiplayer_results` rows.
6. Close Lobby
   - Host ends lobby; results are persisted; redirect or show summary.

### Anti-cheat / Validation
- Clamp impossible WPM spikes; ignore events with unrealistic deltas.
- Compare raw CPM vs accuracy and elapsed time.
- Optional: server-side text checksum and sampled inputs.

### UI Components
- Lobby list/join form (already have `components/multiplayer/client-join-form.tsx`)
- Lobby room: players list, countdown, progress bars, text area, mini-leaderboard
- Result modal: placement, personal stats, CTA to save/share

### Future Enhancements
- Private/public lobbies, password or invite-only
- Ranked MMR and seasons
- Spectators and replays (store WPM timeline)
- Power-ups for arcade modes


