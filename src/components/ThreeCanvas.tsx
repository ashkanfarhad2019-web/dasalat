/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { BoardScene, BoardCameraPreset } from '../three/BoardScene';
import { Settlement } from '../types/game';

interface ThreeCanvasProps {
  settlements: Record<string, Settlement>;
  playerPos: { x: number; z: number };
  cameraPreset: BoardCameraPreset;
  onSettlementClick: (id: string) => void;
  onBoardClick: (x: number, z: number) => void;
  onSceneReady?: (scene: BoardScene) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  settlements,
  playerPos,
  cameraPreset,
  onSettlementClick,
  onBoardClick,
  onSceneReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BoardScene | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new BoardScene(
      mountRef.current,
      settlements,
      playerPos,
      (id) => onSettlementClick(id),
      (x, z) => onBoardClick(x, z)
    );
    sceneRef.current = scene;

    if (onSceneReady) {
      onSceneReady(scene);
    }

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update camera preset
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Update player figure coordinates
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updatePlayerPosition(playerPos.x, playerPos.z);
    }
  }, [playerPos.x, playerPos.z]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden bg-slate-950 select-none"
      style={{ zIndex: 0 }}
    />
  );
};
