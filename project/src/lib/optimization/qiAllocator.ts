// Quantum-inspired optimization for welfare scheme allocation.
// Uses a simulated annealing / QUBO-style heuristic runnable on classical hardware.

export interface Village {
  id: string;
  name: string;
  resourceScore: number; // 0..1 abundance
  claimPriority: number; // 0..1 urgency
}

export interface Scheme {
  id: string;
  name: string; // e.g., Irrigation, Subsidy
  capacity: number; // how many villages can be assigned
  weightResource: number; // positive weight for resource alignment
  weightClaim: number; // positive weight for claim priority
  penaltyOverlap?: number; // penalty for assigning multiple schemes to same village
}

export interface AllocationResult {
  assignments: Record<string, string[]>; // villageId -> schemeIds
  score: number;
}

function rand() { return Math.random(); }

function scoreAllocation(villages: Village[], schemes: Scheme[], assignment: Record<string, Set<string>>): number {
  let score = 0;
  const villageMap = new Map(villages.map(v => [v.id, v]));
  const schemeMap = new Map(schemes.map(s => [s.id, s]));
  const usage = new Map<string, number>();

  for (const [vId, sIds] of Object.entries(assignment)) {
    const v = villageMap.get(vId)!;
    const k = sIds.size;
    for (const sId of sIds) {
      const s = schemeMap.get(sId)!;
      score += s.weightResource * v.resourceScore + s.weightClaim * v.claimPriority;
      usage.set(sId, (usage.get(sId) || 0) + 1);
      if (s.penaltyOverlap && k > 1) score -= s.penaltyOverlap * (k - 1);
    }
  }

  // capacity penalties
  for (const s of schemes) {
    const u = usage.get(s.id) || 0;
    if (u > s.capacity) score -= (u - s.capacity) * 10; // heavy penalty for exceeding capacity
  }
  return score;
}

function neighbor(assignment: Record<string, Set<string>>, villages: Village[], schemes: Scheme[]): Record<string, Set<string>> {
  const copy: Record<string, Set<string>> = {};
  for (const [k, v] of Object.entries(assignment)) copy[k] = new Set(v);
  if (villages.length === 0 || schemes.length === 0) return copy;
  const v = villages[Math.floor(rand() * villages.length)];
  const s = schemes[Math.floor(rand() * schemes.length)];
  const set = copy[v.id] || (copy[v.id] = new Set<string>());
  if (rand() < 0.5) {
    // toggle assign/remove
    if (set.has(s.id)) set.delete(s.id); else set.add(s.id);
  } else {
    // move: clear and assign one
    set.clear();
    set.add(s.id);
  }
  return copy;
}

export function optimizeAllocation(villages: Village[], schemes: Scheme[], steps = 2000): AllocationResult {
  // initial random assignment respecting capacity loosely
  const current: Record<string, Set<string>> = {};
  for (const v of villages) current[v.id] = new Set<string>();

  let bestAssign = current;
  let bestScore = scoreAllocation(villages, schemes, current);
  let curAssign = current;
  let curScore = bestScore;

  let temp = 1.0;
  const cooling = 0.995;

  for (let i = 0; i < steps; i++) {
    const nxt = neighbor(curAssign, villages, schemes);
    const nxtScore = scoreAllocation(villages, schemes, nxt);
    const delta = nxtScore - curScore;
    if (delta > 0 || Math.exp(delta / Math.max(1e-6, temp)) > rand()) {
      curAssign = nxt;
      curScore = nxtScore;
      if (curScore > bestScore) {
        bestScore = curScore;
        bestAssign = curAssign;
      }
    }
    temp *= cooling;
  }

  const assignments: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(bestAssign)) assignments[k] = Array.from(v);
  return { assignments, score: bestScore };
}


