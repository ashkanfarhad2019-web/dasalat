/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settlement, Kingdom, Lord, PlayerCharacter } from '../types/game';
import {
  Store,
  Users,
  Castle,
  Factory,
  Swords,
  LogOut,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SettlementViewModalProps {
  settlement: Settlement;
  kingdom: Kingdom;
  ownerLord?: Lord;
  player: PlayerCharacter;
  isKurdish: boolean;
  onOpenTrade: () => void;
  onRecruitTroops: () => void;
  onVisitLord: () => void;
  onOpenWorkshops: () => void;
  onBesiege: () => void;
  onLeave: () => void;
}

export const SettlementViewModal: React.FC<SettlementViewModalProps> = ({
  settlement,
  kingdom,
  ownerLord,
  player,
  isKurdish,
  onOpenTrade,
  onRecruitTroops,
  onVisitLord,
  onOpenWorkshops,
  onBesiege,
  onLeave,
}) => {
  const isPlayerOwner = player.fiefs.includes(settlement.id);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Banner Header (Compact for landscape mobile) */}
        <div
          className="relative px-4 py-2.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between gap-2"
          style={{ borderTop: `4px solid ${kingdom?.colorHex || '#f59e0b'}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg text-slate-950 font-black shrink-0"
              style={{ backgroundColor: kingdom?.colorHex || '#f59e0b' }}
            >
              <Castle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                  {settlement.type === 'city' ? (isKurdish ? 'شار' : 'City') : settlement.type === 'castle' ? (isKurdish ? 'قەڵا' : 'Castle') : (isKurdish ? 'گوند' : 'Village')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isKurdish ? kingdom?.nameKu : kingdom?.nameEn}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black text-white font-serif leading-tight">
                {isKurdish ? settlement.nameKu : settlement.nameEn}
              </h2>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[8px] text-slate-400 block">{isKurdish ? 'گارد' : 'Garrison'}</span>
              <span className="text-[11px] font-mono font-bold text-red-400">{settlement.garrison}</span>
            </div>
            <div className="bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[8px] text-slate-400 block">{isKurdish ? 'بوژانەوە' : 'Prosperity'}</span>
              <span className="text-[11px] font-mono font-bold text-emerald-400">{settlement.prosperity}%</span>
            </div>
            {ownerLord && (
              <div className="bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-center hidden sm:block">
                <span className="text-[8px] text-slate-400 block">{isKurdish ? 'میر' : 'Lord'}</span>
                <span className="text-[11px] font-bold text-amber-300">
                  {isKurdish ? ownerLord.nameKu : ownerLord.nameEn}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                soundManager.playClick();
                onLeave();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Hub (Responsive for Landscape Mobile) */}
        <div className="p-3 md:p-4 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            {isKurdish ? settlement.descriptionKu : settlement.descriptionEn}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 1. Market */}
            <button
              onClick={() => {
                soundManager.playCoins();
                onOpenTrade();
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 hover:bg-slate-900/80 text-right transition-all cursor-pointer flex flex-col justify-between gap-1 group"
            >
              <div className="flex items-center justify-between">
                <Store className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded font-bold">
                  {isKurdish ? 'بازار' : 'Trade'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-amber-300">
                  {isKurdish ? 'بازاڕی گشتی' : 'Marketplace'}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isKurdish ? 'کڕین و فرۆشتنی کاڵا' : 'Buy and sell goods'}
                </p>
              </div>
            </button>

            {/* 2. Tavern */}
            <button
              onClick={() => {
                soundManager.playClick();
                onRecruitTroops();
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-400 hover:bg-slate-900/80 text-right transition-all cursor-pointer flex flex-col justify-between gap-1 group"
            >
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded font-bold">
                  {isKurdish ? 'چەکدار' : 'Recruit'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-red-300">
                  {isKurdish ? 'مەیخانە و سەرباز' : 'Tavern Recruits'}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isKurdish ? 'بەکرێگرتنی سوپا' : 'Hire sellswords'}
                </p>
              </div>
            </button>

            {/* 3. Keep & Court */}
            <button
              onClick={() => {
                soundManager.playGavelStrike();
                onVisitLord();
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-400 hover:bg-slate-900/80 text-right transition-all cursor-pointer flex flex-col justify-between gap-1 group"
            >
              <div className="flex items-center justify-between">
                <Castle className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-bold">
                  {isKurdish ? 'دەربار' : 'Court'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-purple-300">
                  {isKurdish ? 'دیداری میر و پاشا' : 'Lord & Court'}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isKurdish ? 'سوێندی دڵسۆزی' : 'Swear fealty as vassal'}
                </p>
              </div>
            </button>

            {/* 4. Workshops */}
            {settlement.type === 'city' && (
              <button
                onClick={() => {
                  soundManager.playCoins();
                  onOpenWorkshops();
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 hover:bg-slate-900/80 text-right transition-all cursor-pointer flex flex-col justify-between gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <Factory className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
                    {isKurdish ? 'کارگە' : 'Income'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-emerald-300">
                    {isKurdish ? 'کڕینی کارگە' : 'Buy Enterprise'}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {isKurdish ? 'داهاتی هەفتانە' : 'Passive weekly gold'}
                  </p>
                </div>
              </button>
            )}

            {/* 5. Siege / Assault */}
            {!isPlayerOwner && (
              <button
                onClick={() => {
                  soundManager.playCrisisWarning();
                  onBesiege();
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 hover:bg-rose-950/30 text-right transition-all cursor-pointer flex flex-col justify-between gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <Swords className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded font-bold">
                    {isKurdish ? 'جەنگ' : 'Assault'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-rose-300">
                    {isKurdish ? 'ئابڵۆقەی قەڵا' : 'Assault Castle'}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {isKurdish ? 'داگیرکردن' : 'Conquer as fief'}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            {isKurdish ? `دیناری تۆ: ${player.gold} D` : `Treasury: ${player.gold} D`}
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onLeave();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isKurdish ? 'گەڕانەوە بۆ بۆرد' : 'Return to Board'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
