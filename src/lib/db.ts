import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Shared Postgres client (Neon, connected via the Vercel Marketplace
 * integration). Every store module (orders, catalog, settings, admin auth)
 * gets its client from here rather than constructing its own.
 *
 * Uses Neon's own serverless driver rather than @vercel/postgres — that
 * package validates connection strings against the format its own
 * first-party "Vercel Postgres" product produces, and rejects this Neon
 * integration's (already-pooled) POSTGRES_URL with a false "use a pooled
 * connection" error.
 *
 * Returns the client itself (not a re-wrapped call signature) so tagged-
 * template queries keep Neon's own return-type inference — wrapping it in a
 * plain function with a fixed signature collapses that to an untyped union.
 */
let client: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL is not set — connect a Postgres database in the Vercel dashboard (Project → Storage).");
    }
    client = neon(connectionString);
  }
  return client;
}
