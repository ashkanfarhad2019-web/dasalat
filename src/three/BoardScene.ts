/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Settlement, RoamingParty } from '../types/game';

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

export type BoardCameraPreset = 'board' | 'tactical' | 'close' | 'overview';

export class BoardScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Camera targets for smooth exponential damping
  private currentCamPos = new THREE.Vector3(0, 26, 22);
  private targetCamPos = new THREE.Vector3(0, 26, 22);
  private currentCamLookAt = new THREE.Vector3(0, 0, 0);
  private targetCamLookAt = new THREE.Vector3(0, 0, 0);

  // Scene interactive objects
  private settlementsGroup = new THREE.Group();
  private settlementMeshes: Map<string, THREE.Group> = new Map();
  private partyMeshes: Map<string, THREE.Group> = new Map();
  private playerPartyGroup: THREE.Group = new THREE.Group();
  private targetAuraRing: THREE.Mesh | null = null;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private onSettlementClickCallback?: (settlementId: string) => void;
  private onBoardClickCallback?: (x: number, z: number) => void;
  private hoveredSettlementId: string | null = null;

  // Animated elements
  private animatedWindmills: THREE.Mesh[] = [];

  constructor(
    container: HTMLElement,
    settlements: Record<string, Settlement>,
    playerPos: { x: number; z: number },
    onSettlementClick?: (id: string) => void,
    onBoardClick?: (x: number, z: number) => void
  ) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.onSettlementClickCallback = onSettlementClick;
    this.onBoardClickCallback = onBoardClick;

    // 1. Software WebGL Guard (read from renderer string, per directives)
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Modern Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12);
    this.scene.fog = new THREE.FogExp2(0x0a0c12, 0.016);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLookAt);

    // 4. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting & Scene Elements
    this.setupLighting();
    this.buildWarBoardTable();
    this.buildTerrainFeatures();
    this.buildSettlements(settlements);
    this.buildPlayerPartyFigure(playerPos);
    this.buildTargetAura();

    // 6. Bind events
    window.addEventListener('resize', this.onResize);
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onPointerClick);

    this.startLoop();
  }

  // --- PROCEDURAL MAP TEXTURES ---

  private createMapBoardTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Parchment / weathered wood base
    ctx.fillStyle = '#222933';
    ctx.fillRect(0, 0, 1024, 1024);

    // Geopolitical terrain zones painted on map
    // Mountain region (North-West)
    const mtnGrad = ctx.createRadialGradient(280, 420, 40, 280, 420, 320);
    mtnGrad.addColorStop(0, '#394657');
    mtnGrad.addColorStop(1, '#222933');
    ctx.fillStyle = mtnGrad;
    ctx.beginPath();
    ctx.arc(280, 420, 320, 0, Math.PI * 2);
    ctx.fill();

    // Desert Oasis / Gold Sultanate (East)
    const desertGrad = ctx.createRadialGradient(780, 520, 50, 780, 520, 340);
    desertGrad.addColorStop(0, '#59442b');
    desertGrad.addColorStop(0.7, '#3d3021');
    desertGrad.addColorStop(1, '#222933');
    ctx.fillStyle = desertGrad;
    ctx.beginPath();
    ctx.arc(780, 520, 340, 0, Math.PI * 2);
    ctx.fill();

    // Steppe North
    const steppeGrad = ctx.createRadialGradient(540, 200, 30, 540, 200, 280);
    steppeGrad.addColorStop(0, '#423c31');
    steppeGrad.addColorStop(1, '#222933');
    ctx.fillStyle = steppeGrad;
    ctx.beginPath();
    ctx.arc(540, 200, 280, 0, Math.PI * 2);
    ctx.fill();

    // Ocean / Coastline Blue Shimmer (West & South-West)
    const seaGrad = ctx.createLinearGradient(0, 0, 300, 800);
    seaGrad.addColorStop(0, '#152538');
    seaGrad.addColorStop(1, 'rgba(21, 37, 56, 0)');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, 320, 1024);

    // Ancient Grid lines & Compass Rhumb lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    ctx.lineWidth = 1.5;
    for (let i = 64; i < 1024; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }

    // Trade Roads linking major settlements
    ctx.strokeStyle = 'rgba(245, 200, 120, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(350, 400); // Hewler
    ctx.lineTo(650, 480); // Baghdad
    ctx.lineTo(800, 720); // Basra
    ctx.moveTo(350, 400);
    ctx.lineTo(200, 300); // Sur
    ctx.moveTo(350, 400);
    ctx.lineTo(550, 220); // Orkhan
    ctx.stroke();
    ctx.setLineDash([]);

    // Gilded board decorative border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 984, 984);
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 952, 952);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  // --- LIGHTING ---

  private setupLighting() {
    // Warm key sun light casting soft shadows on 3D miniature towers
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5);
    keyLight.position.set(16, 28, 18);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 5;
    keyLight.shadow.camera.far = 70;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    // Cool fill light from ambient atmosphere
    const fillLight = new THREE.HemisphereLight(0x5577aa, 0x221812, 1.2);
    this.scene.add(fillLight);

    // Warm lantern candle light placed around the war table
    const tableLantern1 = new THREE.PointLight(0xff9933, 2.0, 28, 1.4);
    tableLantern1.position.set(-15, 6, -12);
    this.scene.add(tableLantern1);

    const tableLantern2 = new THREE.PointLight(0xff9933, 2.0, 28, 1.4);
    tableLantern2.position.set(15, 6, 12);
    this.scene.add(tableLantern2);
  }

  // --- WAR BOARD TABLE ---

  private buildWarBoardTable() {
    // Table Base (Dark Mahogany Frame)
    const frameGeo = new THREE.BoxGeometry(32, 1.6, 26);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x140e0a,
      roughness: 0.35,
      metalness: 0.15,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.8;
    frame.receiveShadow = !this.isSoftwareGl;
    this.scene.add(frame);

    // Gold Brass Molding around the table rim
    const rimGeo = new THREE.BoxGeometry(32.4, 0.4, 26.4);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.25,
    });
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.position.y = -0.15;
    this.scene.add(rim);

    // Inset Map Board Surface
    const boardGeo = new THREE.PlaneGeometry(31.2, 25.2);
    boardGeo.rotateX(-Math.PI / 2);
    const mapTex = this.createMapBoardTexture();
    const boardMat = new THREE.MeshStandardMaterial({
      map: mapTex,
      roughness: 0.3,
      metalness: 0.05,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0.01;
    board.receiveShadow = !this.isSoftwareGl;
    this.scene.add(board);
  }

  // --- PROCEDURAL 3D TERRAIN RELIEF (Mountains & Forests) ---

  private buildTerrainFeatures() {
    // 1. Mountain Ridges (Zagros Mountain Peaks)
    const mtnPositions = [
      { x: -6.5, z: -1.0, s: 1.4 },
      { x: -5.5, z: 1.5, s: 1.8 },
      { x: -7.5, z: 3.5, s: 2.1 },
      { x: -9.5, z: 0.5, s: 1.6 },
      { x: -8.0, z: -4.5, s: 1.5 },
    ];

    const mtnMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
      flatShading: true,
    });
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
    });

    mtnPositions.forEach((pos) => {
      const peakGroup = new THREE.Group();
      // Base Mountain Cone (octagonal)
      const baseGeo = new THREE.ConeGeometry(pos.s * 1.1, pos.s * 1.4, 7);
      const baseMesh = new THREE.Mesh(baseGeo, mtnMat);
      baseMesh.position.y = (pos.s * 1.4) / 2;
      baseMesh.castShadow = !this.isSoftwareGl;
      peakGroup.add(baseMesh);

      // Snow Cap on Top
      const snowGeo = new THREE.ConeGeometry(pos.s * 0.45, pos.s * 0.5, 7);
      const snowMesh = new THREE.Mesh(snowGeo, snowMat);
      snowMesh.position.y = pos.s * 1.15;
      peakGroup.add(snowMesh);

      peakGroup.position.set(pos.x, 0, pos.z);
      this.scene.add(peakGroup);
    });

    // 2. Desert Dunes / Pyramids (East)
    const duneMat = new THREE.MeshStandardMaterial({
      color: 0x92663c,
      roughness: 0.85,
      flatShading: true,
    });
    const dunes = [
      { x: 7.5, z: 1.5, s: 1.1 },
      { x: 10.5, z: -1.5, s: 1.4 },
      { x: 8.5, z: -4.5, s: 0.9 },
    ];
    dunes.forEach((d) => {
      const duneMesh = new THREE.Mesh(new THREE.ConeGeometry(d.s * 1.2, d.s * 0.6, 5), duneMat);
      duneMesh.position.set(d.x, (d.s * 0.6) / 2, d.z);
      this.scene.add(duneMesh);
    });
  }

  // --- PROCEDURAL 3D SETTLEMENT MODELS (Cities, Castles, Villages) ---

  private buildSettlements(settlements: Record<string, Settlement>) {
    this.settlementsGroup = new THREE.Group();

    Object.values(settlements).forEach((set) => {
      const group = new THREE.Group();
      group.userData = { settlementId: set.id, nameKu: set.nameKu, nameEn: set.nameEn };

      if (set.type === 'city') {
        // Multi-part Fortified City Model:
        // 1. Octagonal Stone Curtain Wall
        const wallGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.45, 8);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.y = 0.22;
        wall.castShadow = !this.isSoftwareGl;
        group.add(wall);

        // 2. Central High Citadel Keep Tower
        const keepGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.2, 8);
        const keepMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const keep = new THREE.Mesh(keepGeo, keepMat);
        keep.position.y = 0.6;
        keep.castShadow = !this.isSoftwareGl;
        group.add(keep);

        // 3. Conical Rooftop with Kingdom Color
        const roofColor =
          set.kingdomId === 'zagros'
            ? 0x2563eb
            : set.kingdomId === 'sultanate'
            ? 0xd97706
            : set.kingdomId === 'steppe_khanate'
            ? 0xdc2626
            : 0x0891b2;
        const roofGeo = new THREE.ConeGeometry(0.7, 0.6, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.4 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1.45;
        group.add(roof);

        // 4. Kingdom Flagpole & Banner
        const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(0.35, 1.7, 0);
        group.add(pole);

        const flagGeo = new THREE.PlaneGeometry(0.35, 0.25);
        const flagMat = new THREE.MeshBasicMaterial({ color: roofColor, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.55, 2.05, 0);
        group.add(flag);

        // 5. Warm night lantern glow inside city
        const cityLight = new THREE.PointLight(0xffbb44, 1.2, 5);
        cityLight.position.set(0, 1.1, 0);
        group.add(cityLight);
      } else if (set.type === 'castle') {
        // Castle Keep Model:
        const baseGeo = new THREE.BoxGeometry(1.5, 0.6, 1.5);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.3;
        base.castShadow = !this.isSoftwareGl;
        group.add(base);

        // 4 Corner Turret Towers
        const towerGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.9, 6);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.6 });
        const offsets = [-0.65, 0.65];
        offsets.forEach((ox) => {
          offsets.forEach((oz) => {
            const tower = new THREE.Mesh(towerGeo, towerMat);
            tower.position.set(ox, 0.45, oz);
            tower.castShadow = !this.isSoftwareGl;
            group.add(tower);
          });
        });

        // Banner on top
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6),
          new THREE.MeshStandardMaterial({ color: 0xd4af37 })
        );
        pole.position.set(0, 1.0, 0);
        group.add(pole);

        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.3, 0.2),
          new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide })
        );
        flag.position.set(0.18, 1.25, 0);
        group.add(flag);
      } else {
        // Village / Hamlet Model:
        // 3 Thatched Huts
        const hutMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });
        const thatchMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
        for (let i = 0; i < 3; i++) {
          const ang = (i / 3) * Math.PI * 2;
          const hx = Math.cos(ang) * 0.45;
          const hz = Math.sin(ang) * 0.45;

          const hutBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.38), hutMat);
          hutBody.position.set(hx, 0.14, hz);
          group.add(hutBody);

          const roof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.25, 4), thatchMat);
          roof.rotation.y = Math.PI / 4;
          roof.position.set(hx, 0.38, hz);
          group.add(roof);
        }

        // Windmill with rotating blades
        const millBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.28, 0.65, 8),
          new THREE.MeshStandardMaterial({ color: 0xa8a29e })
        );
        millBase.position.set(0.8, 0.32, -0.2);
        group.add(millBase);

        const bladesGroup = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.08, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x451a03 })
        );
        bladesGroup.position.set(0.8, 0.65, -0.06);
        group.add(bladesGroup);
        this.animatedWindmills.push(bladesGroup);
      }

      // Scale down settlement group to miniature size so 16+ settlements fit crisply on the board
      group.scale.set(0.55, 0.55, 0.55);

      group.position.set(set.boardX, 0, set.boardZ);
      this.settlementMeshes.set(set.id, group);
      this.settlementsGroup.add(group);
    });

    this.scene.add(this.settlementsGroup);
  }

  // --- 3D PLAYER PARTY MINIATURE FIGURE (Moves across board) ---

  private buildPlayerPartyFigure(pos: { x: number; z: number }) {
    this.playerPartyGroup = new THREE.Group();
    this.playerPartyGroup.scale.set(0.65, 0.65, 0.65);

    // Sculpted Chess/Wargame-style Miniature Pawn Base (Pedestal)
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.16, 18);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.08;
    this.playerPartyGroup.add(base);

    // Armored Knight Figure on Top
    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.55, 8);
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.15,
    });
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.48;
    torso.castShadow = !this.isSoftwareGl;
    this.playerPartyGroup.add(torso);

    // 2. Great Helm (Helmet)
    const helmGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.3, 8);
    const helm = new THREE.Mesh(helmGeo, armorMat);
    helm.position.y = 0.88;
    this.playerPartyGroup.add(helm);

    // 3. Shield with golden heraldry
    const shieldGeo = new THREE.BoxGeometry(0.06, 0.45, 0.3);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.25, 0.52, 0);
    this.playerPartyGroup.add(shield);

    // 4. Player War Banner on High Lance
    const lanceGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6);
    const lance = new THREE.Mesh(lanceGeo, baseMat);
    lance.position.set(0.25, 0.9, 0);
    this.playerPartyGroup.add(lance);

    const bannerGeo = new THREE.PlaneGeometry(0.5, 0.35);
    const bannerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0.52, 1.45, 0);
    this.playerPartyGroup.add(banner);

    // Soft Radial Contact Shadow under the player's party
    const shadowGeo = new THREE.PlaneGeometry(1.5, 1.5);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.02;
    this.playerPartyGroup.add(shadow);

    this.playerPartyGroup.position.set(pos.x, 0, pos.z);
    this.scene.add(this.playerPartyGroup);
  }

  // Target Destination Aura
  private buildTargetAura() {
    const ringGeo = new THREE.RingGeometry(0.8, 0.92, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    this.targetAuraRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetAuraRing.position.set(0, 0.05, 0);
    this.targetAuraRing.visible = false;
    this.scene.add(this.targetAuraRing);
  }

  // Move Player Party to coordinates smoothly
  public updatePlayerPosition(x: number, z: number) {
    this.playerPartyGroup.position.x = x;
    this.playerPartyGroup.position.z = z;
  }

  public setDestinationMarker(x: number, z: number, visible: boolean = true) {
    if (this.targetAuraRing) {
      this.targetAuraRing.position.set(x, 0.04, z);
      this.targetAuraRing.visible = visible;
    }
  }

  // --- CAMERA PRESETS ---

  public setCameraPreset(preset: BoardCameraPreset) {
    switch (preset) {
      case 'board':
        this.targetCamPos.set(0, 24, 20);
        this.targetCamLookAt.set(0, 0, 1.0);
        break;
      case 'tactical':
        this.targetCamPos.set(0, 14, 13);
        this.targetCamLookAt.set(0, 0.5, 0);
        break;
      case 'close':
        // Close on player's party
        this.targetCamPos.set(
          this.playerPartyGroup.position.x,
          8,
          this.playerPartyGroup.position.z + 8
        );
        this.targetCamLookAt.copy(this.playerPartyGroup.position);
        break;
      case 'overview':
        this.targetCamPos.set(0, 32, 2);
        this.targetCamLookAt.set(0, 0, 0);
        break;
    }
  }

  // Focus directly on a settlement
  public focusSettlement(settlementId: string) {
    const mesh = this.settlementMeshes.get(settlementId);
    if (mesh) {
      this.targetCamLookAt.copy(mesh.position);
      this.targetCamPos.set(mesh.position.x, 10, mesh.position.z + 9);
      this.setDestinationMarker(mesh.position.x, mesh.position.z, true);
    }
  }

  // --- RAYCASTING & INTERACTION ---

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.settlementsGroup.children, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.settlementId && topObj.parent !== this.settlementsGroup) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData?.settlementId) {
        this.hoveredSettlementId = topObj.userData.settlementId;
        this.container.style.cursor = 'pointer';
        return;
      }
    }

    this.hoveredSettlementId = null;
    this.container.style.cursor = 'default';
  };

  private onPointerClick = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData?.settlementId && obj.parent !== this.scene) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.settlementId) {
        if (this.onSettlementClickCallback) {
          this.onSettlementClickCallback(obj.userData.settlementId);
        }
        return;
      }
    }

    // Board click at coordinates
    if (intersects.length > 0 && this.onBoardClickCallback) {
      const hit = intersects[0];
      if (hit.point.y <= 0.5) {
        this.onBoardClickCallback(hit.point.x, hit.point.z);
      }
    }
  };

  // --- RENDER LOOP ---

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const elapsed = this.clock.getElapsedTime();

    // 1. Smooth exponential camera damping (1 - Math.exp(-k * dt))
    const dampFactor = 1.0 - Math.exp(-4.2 * dt);
    this.currentCamPos.lerp(this.targetCamPos, dampFactor);
    this.currentCamLookAt.lerp(this.targetCamLookAt, dampFactor);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLookAt);

    // 2. Animate windmills
    this.animatedWindmills.forEach((w) => {
      w.rotation.z += 1.2 * dt;
    });

    // 3. Pulse destination aura ring
    if (this.targetAuraRing && this.targetAuraRing.visible) {
      this.targetAuraRing.rotation.z += 0.8 * dt;
      const s = 1.0 + Math.sin(elapsed * 4) * 0.08;
      this.targetAuraRing.scale.set(s, s, s);
    }

    // 4. Gentle banner flutter on player party
    if (this.playerPartyGroup) {
      this.playerPartyGroup.position.y = Math.sin(elapsed * 3) * 0.02;
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private startLoop() {
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('click', this.onPointerClick);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
