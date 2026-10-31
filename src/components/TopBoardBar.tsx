/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerCharacter, CharacterRank } from '../types/game';
import {
  Coins,
  Star,
  Scale,
  Crown,
  Shield,
  Calendar,
  FastForward,
  Save,
  Maximize2,
  Check,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TopBoardBarProps {
  player: PlayerCharacter;
  isKurdish: boolean;
  onAdvanceDay: () => void;
  onOpenCharacterSheet: () => void;
  onSaveGame: () => void;
}

export const TopBoardBar: React.FC<TopBoardBarProps> = ({
  player,
  isKurdish,
  onAdvanceDay,
  onOpenCharacterSheet,
  onSaveGame,
}) => {
  const [savedAlert, setSavedAlert] = useState(false);

  const getRankName = (rank: CharacterRank) => {
    switch (rank) {
      case 'humble':
        return isKurdish ? 'پەنابەری سادە' : 'Commoner';
      case 'trader':
        return isKurdish ? 'بازرگان' : 'Trader';
      case 'captain':
        return isKurdish ? 'فەرماندە' : 'Captain';
      case 'vassal':
        return isKurdish ? 'میری دەربار' : 'Vassal';
      case 'high_lord':
        return isKurdish ? 'خاوەن دەسەڵات' : 'Warlord';
      case 'king':
        return isKurdish ? 'شای شاهان' : 'Supreme King';
    }
  };

  const handleSave = () => {
    soundManager.playGavelStrike();
    onSaveGame();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const totalTroops = player.troops.reduce((acc, t) => acc + t.count, 0);

  return (
    <div className="absolute top-0 inset-x-0 z-20 p-1 md:p-2.5 pointer-events-none select-none flex flex-col gap-1">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 px-1">
        {/* Left: Player Profile & Rank */}
        <div className="flex items-center gap-1.5 bg-slate-900/95 border border-amber-500/40 px-2 py-1 rounded-xl shadow-xl pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCharacterSheet();
            }}
            className="flex items-center gap-1.5 text-right hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] md:text-xs font-black text-white leading-tight">{player.name}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-amber-300 leading-tight">
                {getRankName(player.rank)}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Core RPG & Strategy Metrics (Tailored for mobile landscape) */}
        <div className="flex items-center gap-1 md:gap-2 bg-slate-900/95 border border-slate-700/80 px-2 py-1 rounded-xl shadow-xl pointer-events-auto overflow-x-auto">
          {/* Gold */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/30"
            title={isKurdish ? 'دینار' : 'Dinars'}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-mono font-bold text-amber-200 tabular-nums">
              {player.gold}
            </span>
          </div>

          {/* Renown */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30"
            title={isKurdish ? 'ناوودەنگ' : 'Renown'}
          >
            <Star className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-mono font-bold text-indigo-200 tabular-nums">
              {player.renown}
            </span>
          </div>

          {/* Troops */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-red-950/40 border border-red-500/30"
            title={isKurdish ? 'سوپا' : 'Troops'}
          >
            <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-[11px] md:text-xs font-mono font-bold text-red-200 tabular-nums">
              {totalTroops}/{player.partyLimit}
            </span>
          </div>

          {/* Day */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] md:text-xs font-mono font-bold text-slate-300 tabular-nums">
              {isKurdish ? `ڕۆژی ${player.currentDay}` : `D${player.currentDay}`}
            </span>
          </div>
        </div>

        {/* Right: Save, Fullscreen, and Advance Day */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-md ${
              savedAlert
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-amber-300'
            }`}
            title={isKurdish ? 'پاشەکەوتکردنی یاری لە مۆبایلدا' : 'Save Game'}
          >
            {savedAlert ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isKurdish ? 'پاشەکەوتکرا!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isKurdish ? 'پاشەکەوت' : 'Save'}</span>
              </>
            )}
          </button>

          {/* Fullscreen for mobile landscape */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* March / Advance Day */}
          <button
            onClick={() => {
              soundManager.playClick();
              onAdvanceDay();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isKurdish ? 'تێپەڕاندنی ڕۆژ' : 'March'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
