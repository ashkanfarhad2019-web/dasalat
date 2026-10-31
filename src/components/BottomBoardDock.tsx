/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BoardCameraPreset } from '../three/BoardScene';
import {
  Map,
  User,
  Crown,
  Camera,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface BottomBoardDockProps {
  onOpenCharacterSheet: () => void;
  onOpenPolitics: () => void;
  cameraPreset: BoardCameraPreset;
  onSelectCamera: (preset: BoardCameraPreset) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isKurdish: boolean;
  onToggleLang: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const BottomBoardDock: React.FC<BottomBoardDockProps> = ({
  onOpenCharacterSheet,
  onOpenPolitics,
  cameraPreset,
  onSelectCamera,
  isCollapsed,
  onToggleCollapse,
  isKurdish,
  onToggleLang,
  soundMuted,
  onToggleSound,
}) => {
  return (
    <div
      className="fixed z-20 transition-transform duration-300 pointer-events-auto"
      style={{
        bottom: '16px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 28px)' : '0'})`,
        maxWidth: 'min(960px, 96vw)',
        width: 'max-content',
      }}
    >
      {/* Sleek Collapse Drawer Handle */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleCollapse();
          }}
          className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-bold text-amber-300 bg-slate-900 border-t border-x border-amber-500/40 rounded-t-xl hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKurdish ? 'پیشاندانی مینیو' : 'Show Controls'}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKurdish ? 'شاردنەوەی مینیو (H)' : 'Hide Controls (H)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-2 shadow-2xl flex flex-wrap items-center gap-2 select-none">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          {/* Character & Army */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCharacterSheet();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <User className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{isKurdish ? 'کارەکتەر و سوپا' : 'Party & Troops'}</span>
          </button>

          {/* Kingdom Politics */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPolitics();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{isKurdish ? 'سیاسەت و دەربار' : 'Politics & Kings'}</span>
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

        {/* Camera Preset Switches */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <Camera className="w-3.5 h-3.5 text-slate-400 mx-1 hidden md:block" />
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectCamera('board');
            }}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              cameraPreset === 'board'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKurdish ? 'بۆرد' : 'Board'}
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectCamera('tactical');
            }}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              cameraPreset === 'tactical'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKurdish ? 'تاکتیکی' : 'Tactical'}
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectCamera('close');
            }}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              cameraPreset === 'close'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKurdish ? 'نزیک' : 'Hero'}
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectCamera('overview');
            }}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              cameraPreset === 'overview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isKurdish ? 'سەرەوە' : 'Top-down'}
          </button>
        </div>

        <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

        {/* Audio & Lang */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleLang();
            }}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Language (زمان)"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onToggleSound();
              soundManager.setMuted(!soundMuted);
            }}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
