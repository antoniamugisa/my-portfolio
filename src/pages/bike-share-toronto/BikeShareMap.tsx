import { useEffect, useRef, useCallback } from 'react';
import { Trip, MAP_BOUNDS, STATIONS, HOUR_PROFILE } from './types';
import type { HourlyBucket } from './types';

interface BikeShareMapProps {
  currentHour: number;
  onTripCountChange: (count: number) => void;
  hourlyBuckets?: HourlyBucket[];
}

export default function BikeShareMap({ currentHour, onTripCountChange, hourlyBuckets }: BikeShareMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tripsRef = useRef<Trip[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const latLngToXY = useCallback((
    lat: number, lng: number,
    w: number, h: number,
    zoom: number, panX: number, panY: number
  ): [number, number] => {
    const nx = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const ny = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return [panX + nx * w * zoom, panY + ny * h * zoom];
  }, []);

  const generateTrips = useCallback((hour: number): Trip[] => {
    const count = Math.floor(HOUR_PROFILE[hour] * 180);
    const result: Trip[] = [];
    for (let i = 0; i < count; i++) {
      const fromIdx = Math.floor(Math.random() * STATIONS.length);
      let toIdx = Math.floor(Math.random() * STATIONS.length);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * STATIONS.length);
      result.push({
        from: STATIONS[fromIdx],
        to: STATIONS[toIdx],
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        member: Math.random() < 0.72,
        ebike: Math.random() < 0.28,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }
    return result;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const zoom = zoomRef.current;
    const { x: panX, y: panY } = panRef.current;

    ctx.clearRect(0, 0, W, H);

    // Background
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#0d1829');
    grad.addColorStop(1, '#090c12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(30,42,58,0.6)';
    ctx.lineWidth = 0.5;
    for (let lat = 43.60; lat <= 43.73; lat += 0.02) {
      const [x0, y0] = latLngToXY(lat, MAP_BOUNDS.minLng, W, H, zoom, panX, panY);
      const [x1, y1] = latLngToXY(lat, MAP_BOUNDS.maxLng, W, H, zoom, panX, panY);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    for (let lng = -79.52; lng <= -79.28; lng += 0.03) {
      const [x0, y0] = latLngToXY(MAP_BOUNDS.minLat, lng, W, H, zoom, panX, panY);
      const [x1, y1] = latLngToXY(MAP_BOUNDS.maxLat, lng, W, H, zoom, panX, panY);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }

    // Trip arcs
    for (const trip of tripsRef.current) {
      const [fx, fy] = latLngToXY(trip.from.lat, trip.from.lng, W, H, zoom, panX, panY);
      const [tx, ty] = latLngToXY(trip.to.lat, trip.to.lng, W, H, zoom, panX, panY);
      const color = trip.member ? '0,229,255' : '255,107,53';
      const alpha = trip.alpha * Math.sin(trip.progress * Math.PI);
      const midX = (fx + tx) / 2 - (ty - fy) * 0.15;
      const midY = (fy + ty) / 2 + (tx - fx) * 0.15;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(midX, midY, tx, ty);
      ctx.strokeStyle = `rgba(${color},${alpha * 0.3})`;
      ctx.lineWidth = trip.ebike ? 1.5 : 1;
      ctx.stroke();

      const t = trip.progress;
      const dotX = (1 - t) * (1 - t) * fx + 2 * (1 - t) * t * midX + t * t * tx;
      const dotY = (1 - t) * (1 - t) * fy + 2 * (1 - t) * t * midY + t * t * ty;

      ctx.beginPath();
      ctx.arc(dotX, dotY, trip.ebike ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.fill();

      const grd = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
      grd.addColorStop(0, `rgba(${color},${alpha * 0.4})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    onTripCountChange(tripsRef.current.length);
  }, [latLngToXY, onTripCountChange]);

  // Animation loop
  const animate = useCallback((ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts;
    lastTsRef.current = ts;

    for (const trip of tripsRef.current) {
      trip.progress += trip.speed;
      if (trip.progress > 1) {
        trip.progress = 0;
        trip.alpha = 0.4 + Math.random() * 0.5;
      }
    }

    draw();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [draw]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => observer.disconnect();
  }, []);

  // Start animation
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  const hasRealData = !!(hourlyBuckets && hourlyBuckets.length === 24 && hourlyBuckets.some(b => b.count > 0));

  useEffect(() => {
    if (hasRealData) {
      const realTrips = hourlyBuckets![currentHour].trips;
      tripsRef.current = realTrips.map(rt => ({
        from: rt.from,
        to: rt.to,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        member: rt.isMember,
        ebike: rt.isEbike,
        alpha: 0.4 + Math.random() * 0.5,
      }));
    } else {
      tripsRef.current = generateTrips(currentHour);
    }
  }, [currentHour, generateTrips, hasRealData, hourlyBuckets]);

  // Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      panRef.current.x = mx - (mx - panRef.current.x) * factor;
      panRef.current.y = my - (my - panRef.current.y) * factor;
      zoomRef.current = Math.max(0.5, Math.min(5, zoomRef.current * factor));
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Pan
  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - panRef.current.x,
      y: e.clientY - panRef.current.y,
    };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    panRef.current = {
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    };
  };
  const onMouseUp = () => { isDraggingRef.current = false; };

  return (
    <canvas
      ref={canvasRef}
      className="flex-1 block cursor-crosshair w-full h-full"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
}
