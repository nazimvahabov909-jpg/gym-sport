import "server-only";

/**
 * Lets a page render when the database is not reachable yet.
 *
 * A fresh deploy builds *before* migrations have run, so prerendering would
 * otherwise fail on a schema that does not exist. The fallback applies only
 * during `next build`: at runtime a database error is a real fault and is
 * rethrown, so a broken connection can never masquerade as an empty catalogue.
 */
export async function buildSafe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (process.env.NEXT_PHASE !== "phase-production-build") throw error;
    console.warn(
      `[build] ${label}: database unavailable, rendering empty. ` +
        `Run "npx prisma migrate deploy" and rebuild. (${(error as Error).message})`,
    );
    return fallback;
  }
}

/** Build-time only: an unreachable database means "prerender nothing". */
export async function staticParamsSafe<T>(run: () => Promise<T[]>): Promise<T[]> {
  try {
    return await run();
  } catch {
    // Pages fall back to on-demand rendering, which is correct either way.
    return [];
  }
}
