/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settlement, PlayerCharacter, Workshop } from '../types/game';
import { INITIAL_WORKSHOPS } from '../data/worldData';
import { Factory, CheckCircle2, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface WorkshopsModalProps {
  settlement: Settlement;
  player: PlayerCharacter;
  isKurdish: boolean;
  onBuyWorkshop: (type: Workshop['type'], cost: number, income: number) => void;
  onClose: () => void;
}

export const WorkshopsModal: React.FC<WorkshopsModalProps> = ({
  settlement,
  player,
  isKurdish,
  onBuyWorkshop,
  onClose,
}) => {
  const existingInSettlement = player.workshops.find((w) => w.settlementId === settlement.id);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-3xl max-h-[94vh] bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-emerald-200">
                {isKurdish ? `کارگە و پیشەسازی: ${settlement.nameKu}` : `Enterprises: ${settlement.nameEn}`}
              </h2>
            </div>
          </div>
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

        {/* Content */}
        <div className="p-3 md:p-4 overflow-y-auto space-y-3">
          {existingInSettlement ? (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-white">
                    {isKurdish ? existingInSettlement.nameKu : existingInSettlement.nameEn}
                  </h4>
                  <span className="text-[11px] text-emerald-300">
                    +{existingInSettlement.weeklyIncome} {isKurdish ? 'دینار هەفتانە' : 'Dinars/week'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                {isKurdish ? 'خاوەندارێتی چالاکە' : 'Owned'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {INITIAL_WORKSHOPS.map((ws) => {
                const canAfford = player.gold >= ws.cost;

                return (
                  <div
                    key={ws.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">
                          {isKurdish ? ws.nameKu : ws.nameEn}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          +{ws.weeklyIncome} D/{isKurdish ? 'هەفتە' : 'wk'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {isKurdish ? `تێچوو: ${ws.cost} دینار` : `Cost: ${ws.cost} D`}
                      </span>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playCoins();
                        onBuyWorkshop(ws.type, ws.cost, ws.weeklyIncome);
                      }}
                      className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer disabled:opacity-40"
                    >
                      {isKurdish ? `کڕین (${ws.cost} D)` : `Buy (${ws.cost} D)`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
