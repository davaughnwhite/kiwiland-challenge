export type Town = string;
export type Weight = number;

export class DirectedWeightedGraph {
  private adj: Map<Town, Map<Town, Weight>> = new Map();

  static fromEdgeList(edges: string[]): DirectedWeightedGraph {
    const g = new DirectedWeightedGraph();
    for (const token of edges) {
      // token like "AB5"
      if (!/^[A-Z]{2}\d+$/.test(token)) {
        throw new Error(`Invalid edge token: ${token}`);
      }
      const from = token[0]!;
      const to = token[1]!;
      const weight = Number(token.slice(2));
      g.addEdge(from, to, weight);
    }
    return g;
  }

  addEdge(from: Town, to: Town, weight: Weight) {
    if (from === to) throw new Error("Self-loops are not allowed by the problem statement.");
    if (!this.adj.has(from)) this.adj.set(from, new Map());
    const row = this.adj.get(from)!;
    if (row.has(to)) throw new Error(`Duplicate route ${from}${to} not allowed.`);
    row.set(to, weight);
    if (!this.adj.has(to)) this.adj.set(to, new Map()); // ensure node exists
  }

  neighbors(node: Town): [Town, Weight][] {
    return [...(this.adj.get(node) ?? new Map()).entries()];
  }

  hasNode(node: Town): boolean {
    return this.adj.has(node);
  }

  /** 1) Route distance like A-B-C; returns number or null if any hop missing */
  distanceAlong(path: Town[]): number | null {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const w = this.adj.get(from)?.get(to);
      if (w == null) return null;
      dist += w;
    }
    return dist;
  }

  /** 2) Trips between start and end by stops (exact or max) */
  countTripsByStops(start: Town, end: Town, opts: { exactStops?: number; maxStops?: number }): number {
    const exact = opts.exactStops;
    const max = opts.maxStops;
    if ((exact == null) === (max == null)) {
      throw new Error("Provide exactly one of exactStops or maxStops.");
    }
    let count = 0;
    const limit = (exact ?? max)!;

    const dfs = (node: Town, stops: number) => {
      if (stops > limit) return;
      if (node === end) {
        if (exact != null) {
          if (stops === exact) count++;
        } else {
          if (stops > 0 && stops <= limit) count++; // >0 to avoid zero-stop case
        }
      }
      for (const [nxt] of this.neighbors(node)) {
        dfs(nxt, stops + 1);
      }
    };

    dfs(start, 0);
    return count;
  }

  /** Dijkstra from s to t (usual positive weights assumption holds) */
  private dijkstra(s: Town, t: Town): number | null {
    const dist = new Map<Town, number>();
    const visited = new Set<Town>();
    const pq: Array<[Town, number]> = [];

    for (const v of this.adj.keys()) dist.set(v, Infinity);
    if (!this.hasNode(s) || !this.hasNode(t)) return null;

    const push = (v: Town, d: number) => {
      pq.push([v, d]);
      // simple binary-heap-free “push & sort” for tiny graphs
      pq.sort((a, b) => a[1] - b[1]);
    };

    dist.set(s, 0);
    push(s, 0);

    while (pq.length) {
      const [u, du] = pq.shift()!;
      if (visited.has(u)) continue;
      visited.add(u);
      if (u === t) return du;
      for (const [v, w] of this.neighbors(u)) {
        const alt = du + w;
        if (alt < (dist.get(v) ?? Infinity)) {
          dist.set(v, alt);
          push(v, alt);
        }
      }
    }
    return null;
  }

  /**
   * 3) Shortest route length between start and end.
   * Note: when start===end, we need the shortest cycle returning to start.
   * We do this by checking each outgoing edge (start->v) plus shortest path v->start.
   */
  shortestDistance(start: Town, end: Town): number | null {
    if (!this.hasNode(start) || !this.hasNode(end)) return null;
    if (start !== end) return this.dijkstra(start, end);

    // shortest cycle through start:
    let best: number | null = null;
    for (const [v, w] of this.neighbors(start)) {
      const back = this.dijkstra(v, start);
      if (back != null) {
        const total = w + back;
        if (best == null || total < best) best = total;
      }
    }
    return best;
  }

  /** 4) Count routes with total distance < maxDistance (DFS with pruning; cycles allowed) */
  countRoutesByMaxDistance(start: Town, end: Town, maxDistance: number): number {
    let count = 0;
    const dfs = (node: Town, distSoFar: number) => {
      if (distSoFar >= maxDistance) return;
      if (node === end && distSoFar > 0) count++;
      for (const [nxt, w] of this.neighbors(node)) {
        dfs(nxt, distSoFar + w);
      }
    };
    dfs(start, 0);
    return count;
  }
}

/** Default test graph from the prompt */
export const DEFAULT_GRAPH = DirectedWeightedGraph.fromEdgeList([
  "AB5", "BC4", "CD8", "DC8", "DE6", "AD5", "CE2", "EB3", "AE7"
]);

/** Small helpers **/
export const parsePath = (pathParam: string): Town[] =>
  pathParam.split("-").map(s => s.trim().toUpperCase()).filter(Boolean);
