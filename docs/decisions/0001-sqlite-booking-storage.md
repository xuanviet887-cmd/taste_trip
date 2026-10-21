# ADR-0001: Store booking requests in SQLite

## Status

Accepted

## Date

2026-10-18

## Context

TasteTrip now accepts booking requests and lets an administrator update their status and quote. The first version stored records in a JSON file. That is simple for a prototype, but every update rewrites the full file and it becomes fragile as requests arrive or change concurrently. The server currently runs as one Node.js process and has no database service configured.

## Decision

Use the built-in `node:sqlite` `DatabaseSync` API for booking storage. Keep the SQLite file under `server/data/bookings.sqlite`, enable WAL mode and a busy timeout, and use parameterized statements for inserts, reads, and updates.

On server startup, import any records in the existing `server/data/bookings.json` file with `INSERT OR IGNORE`. Keep the JSON file as a migration backup; do not delete it automatically. Ignore the SQLite database and its WAL files in Git because they contain customer contact information.

Store complete generated multi-day itineraries in a `generated_itineraries` table. The itinerary API returns only Day 1 for a 2–3-day tour; an unlock booking copies the stored itinerary into the booking record. Customer lookup returns the remaining days only after an administrator marks that booking as paid.

Require Node.js 22.13 or newer, where `node:sqlite` is available without an experimental CLI flag. The current server runtime uses synchronous SQLite calls and is intended for the current low-volume, single-process MVP.

## Alternatives considered

### Continue with JSON

- No additional setup.
- Rewriting a shared file for each operation is fragile under concurrent updates and offers no constraints or indexed queries.
- Rejected as the ongoing source of truth.

### Add a hosted PostgreSQL or MySQL service

- Better fit for multiple application instances, managed backups, and higher write volume.
- Requires choosing and configuring a database provider, credentials, migrations, and deployment networking that this project does not currently have.
- Deferred until TasteTrip chooses a production hosting setup or needs multiple server instances.

## Consequences

- Booking creation, administration, and status updates use a structured local database without adding an npm dependency.
- Multi-day paywalled itinerary content stays server-side until payment is confirmed; booking lookup then returns the full itinerary.
- Existing JSON records are imported automatically and remain available as a backup.
- The SQLite file must be backed up and kept on persistent storage when deployed.
- A deployment with multiple app instances or heavier traffic should move to a shared database service; the synchronous API also blocks the event loop while a query runs.
- `node:sqlite` is documented as active development by Node.js. See the [Node.js SQLite documentation](https://nodejs.org/api/sqlite.html).
