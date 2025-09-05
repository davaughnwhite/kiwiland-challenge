import { Router, Request, Response } from "express";
import { DEFAULT_GRAPH, parsePath } from "./graph";

export const router = Router();

// health
router.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * 1) Route distance
 * GET /distance?path=A-B-C
 * -> { distance: 9 } or { error: "NO SUCH ROUTE" }
 */
router.get("/distance", (req: Request, res: Response) => {
  const pathStr = String(req.query.path ?? "");
  if (!pathStr) return res.status(400).json({ error: "path query param required, e.g. A-B-C" });
  const path = parsePath(pathStr);
  if (path.length < 2) return res.status(400).json({ error: "provide at least two towns" });

  const d = DEFAULT_GRAPH.distanceAlong(path);
  if (d == null) return res.status(200).json({ error: "NO SUCH ROUTE" });
  return res.json({ distance: d });
});

/**
 * 2) Trip count by stops
 * GET /trips/stops?start=C&end=C&maxStops=3
 * GET /trips/stops?start=A&end=C&exactStops=4
 */
router.get("/trips/stops", (req: Request, res: Response) => {
  const start = String(req.query.start ?? "").toUpperCase();
  const end = String(req.query.end ?? "").toUpperCase();
  const exactStops = req.query.exactStops != null ? Number(req.query.exactStops) : undefined;
  const maxStops = req.query.maxStops != null ? Number(req.query.maxStops) : undefined;

  if (!start || !end) return res.status(400).json({ error: "start and end are required" });
  try {
    const count = DEFAULT_GRAPH.countTripsByStops(start, end, { exactStops, maxStops });
    return res.json({ count });
  } catch (e: any) {
    return res.status(400).json({ error: e.message ?? "Invalid input" });
  }
});

/**
 * 3) Shortest route length
 * GET /shortest?start=A&end=C
 */
router.get("/shortest", (req: Request, res: Response) => {
  const start = String(req.query.start ?? "").toUpperCase();
  const end = String(req.query.end ?? "").toUpperCase();
  if (!start || !end) return res.status(400).json({ error: "start and end are required" });

  const d = DEFAULT_GRAPH.shortestDistance(start, end);
  if (d == null) return res.status(200).json({ error: "NO SUCH ROUTE" });
  return res.json({ distance: d });
});

/**
 * 4) Route count by max distance
 * GET /routes/max-distance?start=C&end=C&threshold=30
 */
router.get("/routes/max-distance", (req: Request, res: Response) => {
  const start = String(req.query.start ?? "").toUpperCase();
  const end = String(req.query.end ?? "").toUpperCase();
  const threshold = Number(req.query.threshold);
  if (!start || !end || Number.isNaN(threshold)) {
    return res.status(400).json({ error: "start, end, threshold are required" });
  }
  const count = DEFAULT_GRAPH.countRoutesByMaxDistance(start, end, threshold);
  return res.json({ count });
});
