/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settlement, PlayerCharacter } from '../types/game';
import { TROOP_UNITS } from '../data/worldData';
import { Users, Shield, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface RecruitmentModalProps {
  settlement: Settlement;
  player: PlayerCharacter;
  isKurdish: boolean;
  onHireTroop: (troopId: string, count: number, cost: number) => void;
  onClose: () => void;
}

export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({
  settlement,
  player,
  isKurdish,
  onHireTroop,
  onClose,
}) => {
  const currentTotalTroops = player.troops.reduce((acc, t) => acc + t.count, 0);
  const remainingCapacity = player.partyLimit - currentTotalTroops;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-2xl max-h-[94vh] bg-slate-900 border-2 border-red-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-red-200">
                {isKurdish ? 'مەیخانە و بەکرێگرتنی سەرباز' : 'Tavern Recruitment'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              {remainingCapacity} {isKurdish ? 'جێگەی بەتاڵ' : 'slots'}
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 overflow-y-auto space-y-2">
          {settlement.recruitPool.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {isKurdish ? 'چەکداری بەردەست نییە.' : 'No recruits available.'}
            </div>
          ) : (
            settlement.recruitPool.map((poolItem) => {
              const troop = TROOP_UNITS[poolItem.troopId];
              if (!troop) return null;
              const canHireOne = player.gold >= poolItem.cost && remainingCapacity >= 1;

              return (
                <div
                  key={poolItem.troopId}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-red-400 font-bold shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">
                        {isKurdish ? troop.nameKu : troop.nameEn}
                      </h4>
                      <span className="text-[9px] text-slate-400 block">
                        Tier {troop.tier} · {troop.hp} HP · {troop.attack} Atk
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {poolItem.cost} D
                    </span>
                    <button
                      disabled={!canHireOne || poolItem.count <= 0}
                      onClick={() => {
                        soundManager.playGavelStrike();
                        onHireTroop(poolItem.troopId, 1, poolItem.cost);
                      }}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black cursor-pointer disabled:opacity-40"
                    >
                      {isKurdish ? 'بەکرێگرتن' : 'Hire'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
