/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BattleState, PlayerCharacter } from '../types/game';
import {
  Swords,
  Shield,
  Target,
  Zap,
  Trophy,
  Skull,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface BattleModalProps {
  battle: BattleState;
  player: PlayerCharacter;
  isKurdish: boolean;
  onExecuteTactic: (tactic: 'shieldwall' | 'charge' | 'volley' | 'flank') => void;
  onFinishBattle: (victory: boolean) => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({
  battle,
  player,
  isKurdish,
  onExecuteTactic,
  onFinishBattle,
}) => {
  const playerTotalHp = battle.playerTroops.reduce((acc, t) => acc + t.hp * t.count, 0);
  const enemyTotalHp = battle.enemyTroops.reduce((acc, t) => acc + t.hp * t.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-950/90 pointer-events-auto select-none">
      <div className="w-full max-w-3xl max-h-[94vh] bg-slate-900 border-2 border-red-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border-b border-red-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50">
              <Swords className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-white">
                {isKurdish ? `مەیدانی جەنگ: ${battle.enemyNameKu}` : `Battle: ${battle.enemyNameEn}`}
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {isKurdish ? `خولی ${battle.turn}` : `Round ${battle.turn}`}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 space-y-3 overflow-y-auto">
          {/* Troops HP row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-blue-500/30 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-300 block">{isKurdish ? 'سوپای تۆ:' : 'Your Troops:'}</span>
                <span className="text-[10px] text-slate-400">
                  {battle.playerTroops.map((t) => `${t.count} ${t.nameKu}`).join(', ')}
                </span>
              </div>
              <span className="font-mono font-bold text-blue-200">{playerTotalHp} HP</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30 flex justify-between items-center">
              <div>
                <span className="font-bold text-red-400 block">{isKurdish ? 'دوژمن:' : 'Enemy:'}</span>
                <span className="text-[10px] text-slate-400">
                  {battle.enemyTroops.map((t) => `${t.count} ${t.nameKu}`).join(', ')}
                </span>
              </div>
              <span className="font-mono font-bold text-red-300">{enemyTotalHp} HP</span>
            </div>
          </div>

          {/* Ticker Log */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-24 overflow-y-auto space-y-0.5 font-mono text-[11px] text-slate-300">
            {battle.log.map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
          </div>

          {/* Resolution or Tactics */}
          {battle.battlePhase === 'resolved' ? (
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/50 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-base font-black text-amber-400">
                {battle.winner === 'player' ? (
                  <>
                    <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>{isKurdish ? '★ سەرکەوتن لە جەنگدا! ★' : '★ VICTORY! ★'}</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-5 h-5 text-red-500" />
                    <span>{isKurdish ? 'شکست لە جەنگدا!' : 'Defeat!'}</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {battle.winner === 'player'
                  ? isKurdish
                    ? `دەستکەوتی جەنگ: +${battle.lootGold} دینار و +${battle.lootRenown} ناوودەنگ!`
                    : `Spoils: +${battle.lootGold} Dinars and +${battle.lootRenown} Renown!`
                  : isKurdish
                  ? 'سوپاکەت پاشەکشەی کرد.'
                  : 'Your forces took casualties and retreated.'}
              </p>
              <button
                onClick={() => {
                  soundManager.playGavelStrike();
                  onFinishBattle(battle.winner === 'player');
                }}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
              >
                {isKurdish ? 'کۆتاییهێنان و گەڕانەوە' : 'Finish & Return'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => {
                  soundManager.playGavelStrike();
                  onExecuteTactic('shieldwall');
                }}
                className="p-2 rounded-xl bg-slate-950 border border-blue-500/40 hover:bg-blue-950/50 text-center transition-all cursor-pointer flex flex-col items-center gap-0.5"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-bold text-white leading-tight">
                  {isKurdish ? 'دیواری قەڵغان' : 'Shieldwall'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundManager.playGavelStrike();
                  onExecuteTactic('charge');
                }}
                className="p-2 rounded-xl bg-slate-950 border border-red-500/40 hover:bg-red-950/50 text-center transition-all cursor-pointer flex flex-col items-center gap-0.5"
              >
                <Swords className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-bold text-white leading-tight">
                  {isKurdish ? 'هێرش' : 'Charge'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onExecuteTactic('volley');
                }}
                className="p-2 rounded-xl bg-slate-950 border border-emerald-500/40 hover:bg-emerald-950/50 text-center transition-all cursor-pointer flex flex-col items-center gap-0.5"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-white leading-tight">
                  {isKurdish ? 'بارانی تیر' : 'Volley'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundManager.playGavelStrike();
                  onExecuteTactic('flank');
                }}
                className="p-2 rounded-xl bg-slate-950 border border-amber-500/40 hover:bg-amber-950/50 text-center transition-all cursor-pointer flex flex-col items-center gap-0.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold text-white leading-tight">
                  {isKurdish ? 'دەورگرتن' : 'Flank'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
