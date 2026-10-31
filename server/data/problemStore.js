/**
 * In-Memory Problem Store for DSA Preparation & Revision Tracking
 * Problems are added when users track them or import them.
 * Starts completely empty for fresh accounts.
 */
let storedProblems = [];

export function getStoredProblems() {
  return storedProblems;
}

export function addProblemToStore(problem) {
  storedProblems.unshift(problem);
  return problem;
}

export function updateProblemInStore(id, updates) {
  const index = storedProblems.findIndex(p => p.id === id);
  if (index === -1) return null;
  storedProblems[index] = {
    ...storedProblems[index],
    ...updates,
    lastReviewed: new Date().toISOString().split('T')[0]
  };
  return storedProblems[index];
}

export function getDueProblems() {
  return storedProblems.filter(p => p.revisionStatus === 'Due');
}

export function clearProblemStore() {
  storedProblems = [];
}
