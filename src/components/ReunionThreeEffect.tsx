import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Play, RotateCcw, X, Volume2, VolumeX, CheckCircle } from 'lucide-react';

export type EffectType = 'bottle' | 'orbit' | 'sakura' | 'constellation' | 'origami';

export interface EffectMeta {
  id: EffectType;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  badge: string;
  tags: string[];
}

export const EFFECT_PRESETS: EffectMeta[] = [
  {
    id: 'bottle',
    number: 1,
    title: '光の鍵とアンティークボトル',
    subtitle: 'Bottle Unlock & Light Burst',
    description: '夕暮れの海原に浮かぶガラスボトルと黄金のアンティークキー。鍵穴に吸い込まれて回転し、数千粒の星屑が夜空へ吹き上がります。',
    themeColor: '#10b981',
    badge: '王道・感涙',
    tags: ['3Dボトル', '黄金キー', '光の粒子バースト', '星屑スパイラル']
  },
  {
    id: 'orbit',
    number: 2,
    title: '運命の二重光輪・リング解封',
    subtitle: 'Celestial Dual Orbit & Unlock',
    description: '離れていた二つの時間軸を象徴する光のリングが引き寄せ合い、中央で完璧に重なって解封のショックウェーブが広がります。',
    themeColor: '#6366f1',
    badge: '神秘・エモーショナル',
    tags: ['二重光輪', '軌道同期', 'ショックウェーブ波紋', 'オーロラ光']
  },
  {
    id: 'sakura',
    number: 3,
    title: '時の砂時計と舞い散る記憶の花びら',
    subtitle: 'Hourglass of Time & Sakura Petals',
    description: '止まっていた時の砂時計が光を放ち、逆流した砂が満開の桜の花びらとなって画面いっぱいにふわりと舞い散ります。',
    themeColor: '#ec4899',
    badge: '日本の情緒・ノスタルジー',
    tags: ['3D砂時計', '砂の逆流', '桜花びらシミュレーション', '時間解放']
  },
  {
    id: 'constellation',
    number: 4,
    title: '星空の記憶星座の結線',
    subtitle: 'Constellation Convergence & Key',
    description: '思い出の星々が光の糸で一本ずつ結ばれ、夜空に大きな「輝く鍵」の星座を形成。完成した瞬間にまばゆい星光が解き放たれます。',
    themeColor: '#0ea5e9',
    badge: 'ロマンチック・モダン',
    tags: ['記憶ノード結線', '星間レーザー', '鍵の星座', 'スターダスト']
  },
  {
    id: 'origami',
    number: 5,
    title: '黄金の折り紙レターと折り鶴の飛翔',
    subtitle: 'Origami Crane & Golden Unfolding',
    description: '封蝋のついた手紙と黄金の折り鶴が光を帯びて羽ばたき、一枚の光り輝く手紙へと優雅に解封されていきます。',
    themeColor: '#f59e0b',
    badge: '優美・上質',
    tags: ['3D折り鶴', '封蝋解封', '光の展開', 'ゴールドプリズム']
  }
];

interface ReunionThreeEffectProps {
  effectType?: EffectType;
  onComplete?: () => void;
  onClose?: () => void;
  isInteractivePreview?: boolean;
  speed?: number;
  particleDensity?: number;
  showControlBar?: boolean;
  className?: string;
  targetName?: string;
  postDate?: string;
}

export const ReunionThreeEffect: React.FC<ReunionThreeEffectProps> = ({
  effectType = 'bottle',
  onComplete,
  onClose,
  isInteractivePreview = false,
  speed = 1.0,
  particleDensity = 1.0,
  showControlBar = true,
  className = '',
  targetName = '三浦 拓也',
  postDate = '2026.8.25'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Simple synthesised chime on key milestones
  const playSoundEffect = (type: 'tick' | 'unlock' | 'sparkle') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'unlock') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
        osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.35); // E6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'sparkle') {
        const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        chords.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.06);
          g.gain.setValueAtTime(0.06, now + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.6);
          o.start(now + i * 0.06);
          o.stop(now + i * 0.06 + 0.6);
        });
      }
    } catch {
      // Audio context might be restricted
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfff0c2, 3, 50);
    pointLight.position.set(2, 4, 8);
    scene.add(pointLight);

    const backPointLight = new THREE.PointLight(0x38bdf8, 2, 40);
    backPointLight.position.set(-3, -2, -4);
    scene.add(backPointLight);

    const group = new THREE.Group();
    scene.add(group);

    // Objects & Variables for each effect mode
    let particles: THREE.Points | null = null;
    let particlePositions: Float32Array;
    let particleVelocities: Float32Array;
    let mainMesh: THREE.Object3D | null = null;
    let subMesh: THREE.Object3D | null = null;
    let linesMesh: THREE.LineSegments | null = null;
    let burstParticles: THREE.Points | null = null;
    let burstPositions: Float32Array;
    let burstVelocities: Float32Array;

    const particleCount = Math.floor(600 * particleDensity);

    // =========================================================================
    // EFFECT 1: BOTTLE & LIGHT BURST
    // =========================================================================
    if (effectType === 'bottle') {
      // Bottle Body (Cylinder + Cone neck)
      const bottleGroup = new THREE.Group();
      
      const bodyGeo = new THREE.CylinderGeometry(1.2, 1.4, 3.2, 32);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x86efac,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.8,
        ior: 1.5
      });
      const body = new THREE.Mesh(bodyGeo, glassMat);
      bottleGroup.add(body);

      const neckGeo = new THREE.CylinderGeometry(0.5, 1.2, 1.2, 32);
      const neck = new THREE.Mesh(neckGeo, glassMat);
      neck.position.y = 2.0;
      bottleGroup.add(neck);

      // Cork
      const corkGeo = new THREE.CylinderGeometry(0.48, 0.44, 0.6, 24);
      const corkMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
      const cork = new THREE.Mesh(corkGeo, corkMat);
      cork.position.y = 2.7;
      bottleGroup.add(cork);

      // Letter inside bottle (Rolled parchment)
      const scrollGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.0, 16);
      const scrollMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
      const scroll = new THREE.Mesh(scrollGeo, scrollMat);
      scroll.position.set(0, -0.2, 0);
      scroll.rotation.z = 0.2;
      bottleGroup.add(scroll);

      // Gold Key
      const keyGroup = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.5, 0.12, 16, 32);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.3
      });
      const keyRing = new THREE.Mesh(ringGeo, goldMat);
      keyRing.position.y = 1.0;
      keyGroup.add(keyRing);

      const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16);
      const shaft = new THREE.Mesh(shaftGeo, goldMat);
      shaft.position.y = 0;
      keyGroup.add(shaft);

      const bitGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
      const bit1 = new THREE.Mesh(bitGeo, goldMat);
      bit1.position.set(0.18, -0.6, 0);
      keyGroup.add(bit1);
      const bit2 = new THREE.Mesh(bitGeo, goldMat);
      bit2.position.set(0.18, -0.85, 0);
      keyGroup.add(bit2);

      keyGroup.position.set(0, 5, 0);
      keyGroup.rotation.x = Math.PI / 2;

      bottleGroup.position.set(0, -0.5, 0);
      group.add(bottleGroup);
      group.add(keyGroup);

      mainMesh = bottleGroup;
      subMesh = keyGroup;

      // Spiral particle dust
      const pGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 4;
        particlePositions[i * 3] = Math.cos(theta) * radius;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        particlePositions[i * 3 + 2] = Math.sin(theta) * radius;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x34d399,
        size: 0.12,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(pGeo, pMat);
      group.add(particles);
    }

    // =========================================================================
    // EFFECT 2: CELESTIAL DUAL ORBIT & UNLOCK
    // =========================================================================
    else if (effectType === 'orbit') {
      const orbitGroup1 = new THREE.Group();
      const ringGeo1 = new THREE.TorusGeometry(2.2, 0.08, 24, 64);
      const ringMat1 = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.1
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      orbitGroup1.add(ring1);

      const orbitGroup2 = new THREE.Group();
      const ringGeo2 = new THREE.TorusGeometry(2.2, 0.08, 24, 64);
      const ringMat2 = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.1
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      orbitGroup2.add(ring2);

      // Central Lock & Core Crystal
      const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xeab308,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: false
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      orbitGroup1.position.set(-3.5, 0, 0);
      orbitGroup2.position.set(3.5, 0, 0);
      group.add(orbitGroup1);
      group.add(orbitGroup2);

      mainMesh = orbitGroup1;
      subMesh = orbitGroup2;

      // Particle halo
      const pGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const r = 2.5 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        particlePositions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.sin(phi);
        particlePositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x818cf8,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(pGeo, pMat);
      group.add(particles);
    }

    // =========================================================================
    // EFFECT 3: HOURGLASS OF TIME & SAKURA PETALS
    // =========================================================================
    else if (effectType === 'sakura') {
      const hgGroup = new THREE.Group();
      
      // Top & Bottom Cones
      const coneGeo = new THREE.ConeGeometry(1.4, 2.0, 32, 1, true);
      const hgGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xfce7f3,
        transparent: true,
        opacity: 0.5,
        roughness: 0.05,
        transmission: 0.85
      });
      const topCone = new THREE.Mesh(coneGeo, hgGlassMat);
      topCone.rotation.x = Math.PI;
      topCone.position.y = 1.0;
      hgGroup.add(topCone);

      const botCone = new THREE.Mesh(coneGeo, hgGlassMat);
      botCone.position.y = -1.0;
      hgGroup.add(botCone);

      // Wooden caps
      const capGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.25, 32);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const topCap = new THREE.Mesh(capGeo, woodMat);
      topCap.position.y = 2.1;
      hgGroup.add(topCap);
      const botCap = new THREE.Mesh(capGeo, woodMat);
      botCap.position.y = -2.1;
      hgGroup.add(botCap);

      group.add(hgGroup);
      mainMesh = hgGroup;

      // Sakura petals (Pink diamond geometry)
      const pGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      particleVelocities = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 12;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        particleVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
        particleVelocities[i * 3 + 1] = 0.015 + Math.random() * 0.03; // Floating upward
        particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xf472b6,
        size: 0.16,
        transparent: true,
        opacity: 0.9,
        blending: THREE.NormalBlending
      });
      particles = new THREE.Points(pGeo, pMat);
      group.add(particles);
    }

    // =========================================================================
    // EFFECT 4: CONSTELLATION CONVERGENCE & KEY
    // =========================================================================
    else if (effectType === 'constellation') {
      const starNodes = [
        new THREE.Vector3(-2.5, 2.5, 0),
        new THREE.Vector3(2.5, 2.5, 0),
        new THREE.Vector3(2.5, -2.5, 0),
        new THREE.Vector3(-2.5, -2.5, 0),
        // Key Shape in center
        new THREE.Vector3(0, 1.8, 0), // Top ring
        new THREE.Vector3(-0.6, 1.2, 0),
        new THREE.Vector3(0.6, 1.2, 0),
        new THREE.Vector3(0, 0.6, 0), // Base of ring
        new THREE.Vector3(0, -0.6, 0), // Shaft
        new THREE.Vector3(0, -1.8, 0), // Shaft tip
        new THREE.Vector3(0.6, -1.2, 0), // Bit 1
        new THREE.Vector3(0.6, -1.6, 0), // Bit 2
      ];

      const linePoints: THREE.Vector3[] = [];
      // Connect key points
      linePoints.push(starNodes[4], starNodes[5]);
      linePoints.push(starNodes[5], starNodes[7]);
      linePoints.push(starNodes[7], starNodes[6]);
      linePoints.push(starNodes[6], starNodes[4]);
      linePoints.push(starNodes[7], starNodes[8]);
      linePoints.push(starNodes[8], starNodes[9]);
      linePoints.push(starNodes[8], starNodes[10]);
      linePoints.push(starNodes[9], starNodes[11]);
      // Outer connecting lines
      linePoints.push(starNodes[0], starNodes[4]);
      linePoints.push(starNodes[1], starNodes[4]);
      linePoints.push(starNodes[2], starNodes[9]);
      linePoints.push(starNodes[3], starNodes[9]);

      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      linesMesh = new THREE.LineSegments(lineGeo, lineMat);
      group.add(linesMesh);

      // Star nodes mesh
      const starGeo = new THREE.BufferGeometry().setFromPoints(starNodes);
      const starMat = new THREE.PointsMaterial({
        color: 0xbae6fd,
        size: 0.25,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const starPoints = new THREE.Points(starGeo, starMat);
      group.add(starPoints);
      mainMesh = starPoints;

      // Background ambient stardust
      const pGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 14;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.08,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(pGeo, pMat);
      group.add(particles);
    }

    // =========================================================================
    // EFFECT 5: ORIGAMI CRANE & GOLDEN LETTER
    // =========================================================================
    else if (effectType === 'origami') {
      const letterGroup = new THREE.Group();

      // Envelope Body (Prism / Box)
      const envGeo = new THREE.BoxGeometry(3.2, 2.0, 0.08);
      const envMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.4,
        metalness: 0.2
      });
      const env = new THREE.Mesh(envGeo, envMat);
      letterGroup.add(env);

      // Red/Gold Wax Seal
      const waxGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24);
      const waxMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xb45309,
        emissiveIntensity: 0.5
      });
      const wax = new THREE.Mesh(waxGeo, waxMat);
      wax.rotation.x = Math.PI / 2;
      wax.position.z = 0.08;
      letterGroup.add(wax);

      // Origami Crane Body (Pyramid geometry)
      const craneGroup = new THREE.Group();
      const wingGeo = new THREE.ConeGeometry(0.8, 1.8, 3);
      const goldWingMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.85,
        roughness: 0.25
      });
      const leftWing = new THREE.Mesh(wingGeo, goldWingMat);
      leftWing.rotation.z = Math.PI / 3;
      leftWing.position.set(-0.8, 0, 0);
      craneGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, goldWingMat);
      rightWing.rotation.z = -Math.PI / 3;
      rightWing.position.set(0.8, 0, 0);
      craneGroup.add(rightWing);

      craneGroup.position.set(0, 0.5, 0.4);
      letterGroup.add(craneGroup);

      group.add(letterGroup);
      mainMesh = letterGroup;
      subMesh = craneGroup;

      // Golden sparkle particles
      const pGeo = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 10;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xfde047,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(pGeo, pMat);
      group.add(particles);
    }

    // Burst Sparkles on Unlock (Shared across all effects)
    const burstCount = 300;
    const bGeo = new THREE.BufferGeometry();
    burstPositions = new Float32Array(burstCount * 3);
    burstVelocities = new Float32Array(burstCount * 3);
    for (let i = 0; i < burstCount; i++) {
      burstPositions[i * 3] = 0;
      burstPositions[i * 3 + 1] = 0;
      burstPositions[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speedV = 0.05 + Math.random() * 0.15;
      burstVelocities[i * 3] = Math.cos(angle) * speedV;
      burstVelocities[i * 3 + 1] = (Math.random() - 0.5) * speedV * 2;
      burstVelocities[i * 3 + 2] = Math.sin(angle) * speedV;
    }
    bGeo.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const bMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    burstParticles = new THREE.Points(bGeo, bMat);
    group.add(burstParticles);

    // =========================================================================
    // ANIMATION LOOP & TIMELINE
    // =========================================================================
    let startTime = performance.now();
    let hasPlayedUnlockSound = false;
    let hasPlayedBurstSound = false;

    const animate = (currentTime: number) => {
      animFrameId.current = requestAnimationFrame(animate);

      const elapsed = (currentTime - startTime) / 1000 * speed;
      const totalDuration = 5.0; // 5 seconds default full sequence
      const progress = Math.min(elapsed / totalDuration, 1.0);
      setCurrentProgress(Math.floor(progress * 100));

      if (progress >= 0.4 && !hasPlayedUnlockSound) {
        playSoundEffect('unlock');
        hasPlayedUnlockSound = true;
      }
      if (progress >= 0.75 && !hasPlayedBurstSound) {
        playSoundEffect('sparkle');
        hasPlayedBurstSound = true;
      }

      // Group general gentle float
      group.rotation.y = Math.sin(elapsed * 0.5) * 0.15;
      group.position.y = Math.sin(elapsed * 1.5) * 0.15;

      // Specific Effect Animations
      if (effectType === 'bottle') {
        if (mainMesh && subMesh) {
          // Key descends into the cork
          if (progress < 0.4) {
            const keyT = progress / 0.4;
            subMesh.position.y = 5.0 - keyT * 2.8;
            subMesh.rotation.y += 0.05;
          } else if (progress < 0.7) {
            // Key turns 360 degrees
            const turnT = (progress - 0.4) / 0.3;
            subMesh.rotation.z = turnT * Math.PI * 2;
            subMesh.position.y = 2.2;
            // Cork pops up slightly
            mainMesh.rotation.z = Math.sin(turnT * Math.PI * 4) * 0.05;
          } else {
            // Unlocked: Bottle glows & floats forward
            const expandT = (progress - 0.7) / 0.3;
            camera.position.z = 10 - expandT * 2.5;
            pointLight.intensity = 3 + expandT * 5;
          }
        }
      } else if (effectType === 'orbit') {
        if (mainMesh && subMesh) {
          if (progress < 0.5) {
            const t = progress / 0.5;
            mainMesh.position.x = -3.5 + t * 3.5;
            subMesh.position.x = 3.5 - t * 3.5;
            mainMesh.rotation.z += 0.04;
            subMesh.rotation.z -= 0.04;
            mainMesh.rotation.x += 0.02;
            subMesh.rotation.y += 0.02;
          } else {
            // Locked into unified orbit
            mainMesh.position.x = 0;
            subMesh.position.x = 0;
            mainMesh.rotation.z += 0.08;
            subMesh.rotation.z -= 0.08;
            const shockwave = (progress - 0.5) / 0.5;
            camera.position.z = 10 - Math.sin(shockwave * Math.PI) * 1.5;
          }
        }
      } else if (effectType === 'sakura') {
        if (mainMesh) {
          mainMesh.rotation.y += 0.01;
          if (progress > 0.3 && progress < 0.6) {
            // Hourglass flips
            const flipT = (progress - 0.3) / 0.3;
            mainMesh.rotation.z = flipT * Math.PI;
          }
        }
        if (particles && particlePositions && particleVelocities) {
          const pos = particles.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] += particleVelocities[i * 3 + 1];
            pos[i * 3] += Math.sin(elapsed + i) * 0.01;
            if (pos[i * 3 + 1] > 6) {
              pos[i * 3 + 1] = -6;
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }
      } else if (effectType === 'constellation') {
        if (linesMesh) {
          linesMesh.rotation.z = Math.sin(elapsed * 0.3) * 0.1;
          (linesMesh.material as THREE.LineBasicMaterial).opacity = Math.min(1.0, progress * 1.5);
        }
        if (mainMesh) {
          mainMesh.rotation.z = Math.sin(elapsed * 0.3) * 0.1;
        }
      } else if (effectType === 'origami') {
        if (mainMesh && subMesh) {
          if (progress < 0.4) {
            mainMesh.rotation.y = Math.sin(elapsed * 2) * 0.2;
          } else {
            // Wings flap & crane ascends
            const flightT = (progress - 0.4) / 0.6;
            subMesh.position.y = 0.5 + flightT * 4.0;
            subMesh.position.z = 0.4 + flightT * 2.0;
            subMesh.rotation.x = Math.sin(elapsed * 12) * 0.3;
            mainMesh.rotation.x = flightT * 0.5;
          }
        }
      }

      // Sparkle particles update
      if (particles) {
        particles.rotation.y += 0.003;
      }

      // Burst activation
      if (burstParticles && progress >= 0.7) {
        (burstParticles.material as THREE.PointsMaterial).opacity = Math.max(0, 1.0 - (progress - 0.7) / 0.3);
        const bPos = burstParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < burstCount; i++) {
          bPos[i * 3] += burstVelocities[i * 3];
          bPos[i * 3 + 1] += burstVelocities[i * 3 + 1];
          bPos[i * 3 + 2] += burstVelocities[i * 3 + 2];
        }
        burstParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (progress >= 1.0 && !isDone) {
        setIsDone(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    animFrameId.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [effectType, speed, particleDensity, soundEnabled]);

  const activePreset = EFFECT_PRESETS.find(p => p.id === effectType) || EFFECT_PRESETS[0];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] overflow-hidden select-none ${className}`}
    >
      {/* 3D Canvas Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Actual Page Mock Layout Layer (Behind / In Sync with 3D Effect) */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-auto z-20">
        
        {/* Top Header Section */}
        <div className="w-full max-w-2xl text-center space-y-4 pt-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 backdrop-blur-md px-5 py-2 rounded-full border border-emerald-400/40 text-emerald-900 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] shadow-sm">
            <Sparkles size={16} className="text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>思い出の鍵が繋がりました！</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 font-bold tracking-wider leading-relaxed drop-shadow-xs">
            <span className="block text-slate-900 mb-1">{targetName} 様、</span>
            <span className="text-emerald-600 bg-clip-text font-bold">
              思い出の鍵が解かれました！✨
            </span>
          </h1>

          <div className="max-w-xl mx-auto space-y-2 text-slate-700 font-serif text-xs sm:text-sm md:text-base leading-relaxed bg-white/75 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-md">
            <p className="font-semibold text-slate-900">
              思い出の鍵が解かれ、ボトルメールが安全に開封されました。
            </p>
            <p className="text-emerald-800 font-bold">
              大切なメッセージを読み、差出人の連絡先へ直接お返事をお送りください。
            </p>
            <div className="pt-2 border-t border-emerald-100 flex items-center justify-center gap-2 text-slate-500 font-sans text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>このボトルメールは {postDate} に投函されました</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Sequence Status */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg space-y-2 my-auto">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Sparkles size={14} />
              {activePreset.title} (No.{activePreset.number})
            </span>
            <span className="font-mono text-emerald-800">{currentProgress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 transition-all duration-150 rounded-full"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>{currentProgress < 40 ? '1. 鍵の探索＆位置合わせ' : currentProgress < 75 ? '2. 記憶の照合＆鍵の回転' : currentProgress < 100 ? '3. 封印解除・光の解き放ち' : '✨ 解封完了'}</span>
            <span className="font-bold text-slate-700">{activePreset.badge}</span>
          </div>
        </div>

        {/* Bottom Control Bar */}
        {showControlBar && (
          <div className="w-full max-w-xl flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700 text-white shadow-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentProgress(0);
                  setIsDone(false);
                  // Trigger re-mount or restart
                  const el = containerRef.current;
                  if (el) {
                    el.style.opacity = '0.99';
                    setTimeout(() => { el.style.opacity = '1'; }, 10);
                  }
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw size={14} />
                <span>最初から再生</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  soundEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                title={soundEnabled ? 'サウンドON' : 'サウンドOFF'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} />
                  <span>閉じる / スキップ</span>
                </button>
              )}

              {onComplete && isDone && (
                <button
                  onClick={onComplete}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle size={14} />
                  <span>手紙本文へ進む →</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
