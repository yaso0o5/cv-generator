"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 uRes; uniform float uTime; uniform vec2 uPointer; uniform float uOn;
uniform vec3 uPaper, uInkA, uInkB; uniform float uCell, uAngle, uBloom, uGrain;

float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), u.x),
             mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 4; i++){ v += a * vn(p); p = p * 2.01 + 9.1; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float screenDot(vec2 sp, float tone, float ang, float cell){
  vec2 g = rot(ang) * sp / cell;
  vec2 c = fract(g) - 0.5;
  float r = sqrt(max(0.0, tone)) * 0.564;
  float aa = fwidth(g.x) * 1.2 + 0.0015;
  return smoothstep(r + aa, r - aa, length(c));
}
void main(){
  vec2 sp = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.06;
  vec2 w = vec2(fbm(sp * 1.3 + t), fbm(sp * 1.3 - t + 5.2)) - 0.5;
  float field = fbm(sp * 1.9 + w * 0.9 + vec2(0.0, t * 1.4));
  vec2 pw = (uPointer - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(sp - pw);
  float bloom = exp(-(d * d) / (uBloom * uBloom)) * uOn;
  float tone = clamp(field * 1.15 - 0.30 + bloom * 0.62, 0.0, 1.0);
  float a = screenDot(sp, tone, uAngle, uCell);
  float b = screenDot(sp, tone * 0.72, uAngle + 1.0472, uCell * 1.18);
  vec3 col = uPaper;
  col = mix(col, uInkB, b * 0.42);
  col = mix(col, uInkA, a);
  col += (h21(gl_FragCoord.xy + fract(uTime) * 17.9) - 0.5) * uGrain;
  O = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export function HalftoneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COARSE = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const FINE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const MOBILE = innerWidth < 768 || COARSE;
    const gl = cv.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      cv.style.background = "#f2efe7";
      return;
    }

    const cfg = {
      paper: "#f2efe7",
      inkA: "#151310",
      inkB: "#d8442e",
      cell: 0.0145,
      angle: 0.2618,
      bloom: 0.34,
      grain: 0.012,
      dprCap: 1.5,
      maxFragments: 2400000,
      fps: 60,
    };

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) throw new Error("Could not create shader.");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh) || "Unknown shader error";
        gl.deleteShader(sh);
        throw new Error(log);
      }
      return sh;
    };

    const prog = gl.createProgram();
    if (!prog) return;
    const vert = compile(gl.VERTEX_SHADER, VERT);
    const frag = compile(gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || "Could not link shader program.");
    }
    gl.useProgram(prog);

    const U: Record<string, WebGLUniformLocation | null> = {};
    for (let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++) {
      const info = gl.getActiveUniform(prog, i);
      if (info) U[info.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(prog, info.name);
    }

    const rgb = (hex: string) => {
      const n = Number.parseInt(hex.slice(1), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };

    const MAX_FRAG = cfg.maxFragments;
    let W = 0, H = 0;
    const fit = () => {
      const w = cv.clientWidth || innerWidth;
      const h = cv.clientHeight || innerHeight;
      const byTier = Math.min(devicePixelRatio || 1, MOBILE ? 1.25 : cfg.dprCap);
      const byArea = Math.sqrt(MAX_FRAG / Math.max(1, w * h));
      const dpr = Math.max(0.6, Math.min(byTier, byArea));
      const nw = Math.round(w * dpr), nh = Math.round(h * dpr);
      if (nw === W && nh === H) return false;
      W = nw; H = nh;
      cv.width = W; cv.height = H;
      gl.viewport(0, 0, W, H);
      return true;
    };

    fit();
    let lastW = innerWidth;
    const onResize = () => {
      if (MOBILE && innerWidth === lastW) return;
      lastW = innerWidth;
      fit();
    };
    addEventListener("resize", onResize, { passive: true });

    const P = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0 };
    const onPointer = (e: PointerEvent) => {
      P.tx = e.clientX / innerWidth;
      P.ty = 1 - e.clientY / innerHeight;
      P.on = 1;
    };
    if (FINE && !MOBILE) addEventListener("pointermove", onPointer, { passive: true });

    gl.uniform3fv(U.uPaper, rgb(cfg.paper));
    gl.uniform3fv(U.uInkA, rgb(cfg.inkA));
    gl.uniform3fv(U.uInkB, rgb(cfg.inkB));
    gl.uniform1f(U.uCell, cfg.cell);
    gl.uniform1f(U.uAngle, cfg.angle);
    gl.uniform1f(U.uBloom, cfg.bloom);
    gl.uniform1f(U.uGrain, cfg.grain);

    const t0 = performance.now();
    let last = t0;
    const budget = 1000 / (MOBILE ? 30 : cfg.fps);
    let raf = 0;
    const draw = (t: number) => {
      if (fit()) gl.viewport(0, 0, W, H);
      gl.uniform2f(U.uRes, W, H);
      gl.uniform1f(U.uTime, RM ? 5 : t);
      gl.uniform2f(U.uPointer, P.x, P.y);
      gl.uniform1f(U.uOn, P.on);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < budget) return;
      const dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      const k = 1 - Math.pow(1 - 0.08, dt * 60);
      P.x += (P.tx - P.x) * k;
      P.y += (P.ty - P.y) * k;
      draw((now - t0) / 1000);
    };

    draw(0);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      if (FINE && !MOBILE) removeEventListener("pointermove", onPointer);
      gl.deleteProgram(prog);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="halftone-background" />;
}
