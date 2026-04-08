const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!

// ── Token management (browser only) ──
export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('ughr_token') || ''
}
export function setToken(token: string) {
  sessionStorage.setItem('ughr_token', token)
}
export function clearToken() {
  sessionStorage.removeItem('ughr_token')
}

// ── Core fetch wrapper ──
async function gasPost(payload: Record<string, unknown>) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    mode: 'no-cors', // GAS requires no-cors
  })
  // no-cors returns opaque response — GAS returns via redirect to GET
  return res
}

// GAS web apps work best with GET for reads and POST for writes
// We use URL params for all calls (GAS doGet pattern)
async function gasCall(func: string, args: unknown[] = []): Promise<unknown> {
  const token = getToken()
  const params = new URLSearchParams({
    func,
    args: JSON.stringify(args),
    token,
    _t: Date.now().toString(),
  })
  const res = await fetch(`${GAS_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data
}

// ── Public functions (no token needed) ──
export async function loginUser(email: string, password: string) {
  const params = new URLSearchParams({
    func: 'loginUser',
    args: JSON.stringify([email, password]),
    _t: Date.now().toString(),
  })
  const res = await fetch(`${GAS_URL}?${params.toString()}`)
  return res.json()
}

export async function validateSession(token: string) {
  const params = new URLSearchParams({
    func: 'validateSession',
    args: JSON.stringify([token]),
    _t: Date.now().toString(),
  })
  const res = await fetch(`${GAS_URL}?${params.toString()}`)
  return res.json()
}

export async function logoutUser(token: string) {
  const params = new URLSearchParams({
    func: 'logoutUser',
    args: JSON.stringify([token]),
    _t: Date.now().toString(),
  })
  const res = await fetch(`${GAS_URL}?${params.toString()}`)
  return res.json()
}

export async function loadAllData() {
  return gasCall('loadAllData', [getToken()])
}

// ── Protected functions ──
export async function runProtected(funcName: string, args: unknown[] = []) {
  const token = getToken()
  const params = new URLSearchParams({
    func: 'runProtected',
    args: JSON.stringify([token, funcName, args]),
    _t: Date.now().toString(),
  })
  const res = await fetch(`${GAS_URL}?${params.toString()}`)
  return res.json()
}

// Convenience wrappers
export const GAS = {
  loadAll: () => loadAllData(),
  login: (email: string, password: string) => loginUser(email, password),
  validate: (token: string) => validateSession(token),
  logout: (token: string) => logoutUser(token),

  // Employee
  addEmployee: (data: unknown) => runProtected('addEmployee', [data]),
  updateEmployee: (data: unknown) => runProtected('updateEmployee', [data]),
  deleteEmployee: (id: string, reason: string) => runProtected('deleteEmployee', [id, reason]),

  // Onboarding
  addOnboarding: (data: unknown) => runProtected('addOnboarding', [data]),
  updateOnboarding: (data: unknown) => runProtected('updateOnboarding', [data]),
  transferToMaster: (obId: string, empData: unknown) => runProtected('transferToMaster', [obId, empData]),

  // 20DS Tracker
  get20DSTracker: () => runProtected('get20DSTracker', []),
  update20DSStep: (dsId: string, stepKey: string, stepData: unknown) =>
    runProtected('update20DSStep', [dsId, stepKey, stepData]),
  update20DSResponsible: (dsId: string, hr: string) =>
    runProtected('update20DSResponsible', [dsId, hr]),
  cancel20DSRecord: (dsId: string, reason: string) =>
    runProtected('cancel20DSRecord', [dsId, reason]),
  get20DSAuditLog: () => runProtected('get20DSAuditLog', []),

  // Leave
  getLeave: (empId: string) => runProtected('getLeave', [empId]),
  addLeave: (data: unknown) => runProtected('addLeave', [data]),
  updateLeaveStatus: (id: string, status: string, notes: string) =>
    runProtected('updateLeaveStatus', [id, status, notes]),

  // Resignations
  getResignations: () => runProtected('getResignations', []),

  // Letters
  generateAndIssueLetter: (data: unknown) => runProtected('generateAndIssueLetter', [data]),
  generateExperienceLetterForEmp: (id: string) =>
    runProtected('generateExperienceLetterForEmp', [id]),

  // Users
  getUsers: () => runProtected('getUsers', []),
  saveUser: (data: unknown) => runProtected('saveUser', [data]),

  // Config
  saveConfig: (cfg: unknown) => runProtected('saveConfig', [cfg]),
  getActivityLog: () => runProtected('getActivityLog', []),
}
