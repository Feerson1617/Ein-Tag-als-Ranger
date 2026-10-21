// Only screen resolution and scheduling change. World state and model detail are independent.
export const GRAPHICS_MODES = {
 auto: { name: 'Automatisch', fps: 30, cap: 2, pixels: 4000000, shadow: 1024, description: '30 Bilder pro Sekunde anstreben und freie Leistung für ein schärferes Bild nutzen.' },
 sharp: { name: 'Hohe Schärfe', fps: 30, cap: 2.5, pixels: 8000000, shadow: 2048, description: 'Schärferes Bild und feinere Schatten. Für leistungsfähige Geräte.' },
 smooth: { name: 'Flüssigere Bewegung', fps: 60, cap: 2, pixels: 4000000, shadow: 1024, description: 'Bis zu 60 Bilder pro Sekunde. Bei hoher Last wird das Bild etwas weicher.' }
};

export class RenderBudget {
 constructor({ dpr = 1, width = 1280, height = 720, mode = 'auto' } = {}) {
  this.dpr = Math.max(1, dpr); this.width = width; this.height = height;
  this.configure(mode);
 }
 get profile() { return GRAPHICS_MODES[this.mode]; }
 get targetFps() { return this.profile.fps; }
 configure(mode) {
  this.mode = GRAPHICS_MODES[mode] ? mode : 'auto';
  this.resize(this.width, this.height);
  this.ratio = this.mode === 'sharp' ? this.maxRatio : Math.min(this.maxRatio, Math.min(this.dpr, 1.35));
  this.reset();
 }
 resize(width, height) {
  const changed = width !== this.width || height !== this.height;
  this.width = Math.max(1, width); this.height = Math.max(1, height);
  // Auto never becomes softer than the previous version. Smooth mode permits a trade-off.
  this.minRatio = this.mode === 'smooth' ? Math.min(this.dpr, 1) : Math.min(this.dpr, 1.35);
  this.maxRatio = Math.max(this.minRatio, Math.min(this.dpr, this.profile.cap, Math.sqrt(this.profile.pixels / (this.width * this.height))));
  if (this.ratio !== undefined) this.ratio = Math.max(this.minRatio, Math.min(this.maxRatio, this.ratio));
  if (changed) this.reset();
 }
 reset() { this.window = []; this.cooldownUntil = 0; }
 sample({ now, spanMs, cpuMs, gpuMs = null, active = true }) {
  if (!active || !Number.isFinite(spanMs) || spanMs <= 0 || spanMs > 250) { this.window = []; return false; }
  this.window.push({ spanMs, cpuMs, gpuMs });
  if (this.window.length < this.targetFps * 3 || now < this.cooldownUntil) return false;
  const percentile = (values, p) => values.sort((a,b) => a-b)[Math.floor((values.length-1)*p)];
  const spans = this.window.map(s => s.spanMs), cpus = this.window.map(s => s.cpuMs), gpu = this.window.map(s => s.gpuMs).filter(Number.isFinite);
  const frame = 1000 / this.targetFps, span = percentile(spans,.9), cpu = percentile(cpus,.9), gpuCost = gpu.length ? percentile(gpu,.9) : null;
  const late = spans.filter(s => s > frame * 1.35).length / spans.length;
  let next = this.ratio;
  if (late > .12 || span > frame * 1.35 || (gpuCost !== null && gpuCost > frame * .85)) next = Math.max(this.minRatio, this.ratio - .15);
  else if (late < .03 && span < frame * 1.2 && cpu < frame * .55 && (gpuCost === null || gpuCost < frame * .55)) next = Math.min(this.maxRatio, this.ratio + .1);
  this.window = []; this.cooldownUntil = now + 5000;
  if (Math.abs(next-this.ratio) < .005) return false;
  this.ratio = next; return true;
 }
}

// Nonblocking GPU samples. Unsupported browsers use frame cadence and CPU time instead.
export class GpuTimer {
 constructor(gl) { this.gl = gl; this.ext = gl.getExtension('EXT_disjoint_timer_query_webgl2'); this.pending = []; this.current = null; this.ms = null; this.frames = 0; }
 begin() {
  if (!this.ext || this.current || this.pending.length >= 4 || this.frames++ % 4) return;
  const q = this.gl.createQuery(); if (!q) return;
  this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, q); this.current = q;
 }
 end() {
  if (!this.current) return;
  this.gl.endQuery(this.ext.TIME_ELAPSED_EXT); this.pending.push(this.current); this.current = null;
 }
 poll() {
  if (!this.ext) return this.ms;
  const gl = this.gl, disjoint = gl.getParameter(this.ext.GPU_DISJOINT_EXT);
  if (disjoint) this.ms = null;
  while (this.pending.length && (disjoint || gl.getQueryParameter(this.pending[0], gl.QUERY_RESULT_AVAILABLE))) {
   const q = this.pending.shift(); if (!disjoint) this.ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1000000;
   gl.deleteQuery(q);
  }
  return this.ms;
 }
}
