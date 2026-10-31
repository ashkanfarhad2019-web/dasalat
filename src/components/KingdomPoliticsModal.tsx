/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Kingdom, Lord, PlayerCharacter, Settlement } from '../types/game';
import {
  Crown,
  Handshake,
  Flame,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface KingdomPoliticsModalProps {
  kingdoms: Record<string, Kingdom>;
  lords: Record<string, Lord>;
  settlements: Record<string, Settlement>;
  player: PlayerCharacter;
  isKurdish: boolean;
  onSwearFealty: (kingdomId: string) => void;
  onDeclareKingdom: (realmNameKu: string, realmNameEn: string) => void;
  onBribeLord: (lordId: string) => void;
  onBlackmailLord: (lordId: string) => void;
  onClose: () => void;
}

export const KingdomPoliticsModal: React.FC<KingdomPoliticsModalProps> = ({
  kingdoms,
  lords,
  settlements,
  player,
  isKurdish,
  onSwearFealty,
  onDeclareKingdom,
  onBribeLord,
  onBlackmailLord,
  onClose,
}) => {
  const [selectedLordId, setSelectedLordId] = useState<string>('king_shirwan');
  const selectedLord = lords[selectedLordId];

  const canDeclareKingdom =
    player.fiefs.length > 0 && player.renown >= 180 && player.rank !== 'king';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border-2 border-purple-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-purple-200">
                {isKurdish ? 'سیاسەتی شانشینەکان و میرایەتی' : 'Feudal Realm Politics & Royal Courts'}
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Lords List (col 4) */}
          <div className="md:col-span-4 border-r border-slate-800 p-2 overflow-y-auto space-y-1.5 bg-slate-950/40 max-h-[30vh] md:max-h-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              {isKurdish ? 'پاشاکان و میرەکان (٦ وڵات):' : 'Kings & Lords (6 Kingdoms):'}
            </span>

            {Object.values(lords).map((l) => {
              const isSelected = l.id === selectedLordId;
              const k = kingdoms[l.kingdomId];

              return (
                <button
                  key={l.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedLordId(l.id);
                  }}
                  className={`w-full text-right p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-1 text-xs ${
                    isSelected
                      ? 'bg-purple-950/70 border-purple-500 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: l.avatarColor }}
                    />
                    <span className="font-bold text-white truncate max-w-[120px]">
                      {isKurdish ? l.nameKu : l.nameEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {l.isKing && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950">
                        {isKurdish ? 'پاشا' : 'KING'}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        l.relationWithPlayer >= 10 ? 'text-emerald-400' : l.relationWithPlayer <= -10 ? 'text-red-400' : 'text-slate-400'
                      }`}
                    >
                      {l.relationWithPlayer > 0 ? '+' : ''}{l.relationWithPlayer}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details (col 8) */}
          {selectedLord && (
            <div className="md:col-span-8 p-3 md:p-4 overflow-y-auto space-y-3 flex flex-col justify-between">
              <div>
                {/* Profile Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md shrink-0"
                      style={{ backgroundColor: selectedLord.avatarColor }}
                    >
                      {selectedLord.nameKu.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-black text-white">
                        {isKurdish ? selectedLord.nameKu : selectedLord.nameEn}
                      </h3>
                      <span className="text-[10px] text-amber-300 block">
                        {isKurdish ? selectedLord.titleKu : selectedLord.titleEn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-center">
                      <span className="text-[8px] text-slate-400 block">{isKurdish ? 'سوپا' : 'Army'}</span>
                      <span className="font-bold text-red-400 font-mono">{selectedLord.armySize}</span>
                    </div>
                    <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-center">
                      <span className="text-[8px] text-slate-400 block">{isKurdish ? 'پەیوەندی' : 'Relation'}</span>
                      <span className="font-bold text-amber-300 font-mono">{selectedLord.relationWithPlayer}</span>
                    </div>
                  </div>
                </div>

                {/* Demands */}
                <div className="my-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    {isKurdish ? 'هەڵوێستی پاشا / میر:' : 'Disposition:'}
                  </span>
                  <p className="text-slate-200 leading-relaxed text-[11px]">
                    {isKurdish ? selectedLord.demandsKu : selectedLord.demandsEn}
                  </p>
                </div>

                {/* Blackmail */}
                {selectedLord.blackmailLeverage && (
                  <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-200 font-mono">
                    <span className="font-bold block text-purple-300">
                      {isKurdish ? '★ مەلەفی ڕەش:' : '★ Leverage:'}
                    </span>
                    {selectedLord.blackmailLeverage}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Swear Fealty */}
                  {selectedLord.isKing && player.allegiance !== selectedLord.kingdomId && (
                    <button
                      disabled={player.renown < 60}
                      onClick={() => {
                        soundManager.playGavelStrike();
                        onSwearFealty(selectedLord.kingdomId);
                      }}
                      className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 text-blue-200 font-bold flex items-center justify-between cursor-pointer disabled:opacity-40"
                    >
                      <div className="flex items-center gap-1.5">
                        <Handshake className="w-4 h-4 text-blue-400" />
                        <span>{isKurdish ? 'سوێندی دڵسۆزی (میری دەربار)' : 'Swear Fealty as Vassal'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">60 {isKurdish ? 'ناوودەنگ' : 'Renown'}</span>
                    </button>
                  )}

                  {/* Bribe Lord */}
                  <button
                    disabled={player.gold < 300}
                    onClick={() => {
                      soundManager.playCoins();
                      onBribeLord(selectedLord.id);
                    }}
                    className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 font-bold flex items-center justify-between cursor-pointer disabled:opacity-40"
                  >
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>{isKurdish ? 'بەخشینی دیاری (+٢٥ پەیوەندی)' : 'Gift Gold (+25 Rel)'}</span>
                    </div>
                    <span className="font-mono text-amber-300">300 D</span>
                  </button>

                  {/* Blackmail */}
                  {selectedLord.blackmailLeverage && (
                    <button
                      onClick={() => {
                        soundManager.playGavelStrike();
                        onBlackmailLord(selectedLord.id);
                      }}
                      className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-purple-400" />
                        <span>{isKurdish ? 'فشار بە مەلەفی ڕەش' : 'Blackmail Lord'}</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Declare Kingdom and Crown King */}
                {canDeclareKingdom && (
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-black text-xs md:text-sm">
                        {isKurdish ? 'تاج لەسەرنان وەک پاشای نوێ!' : 'Crown Yourself Supreme King!'}
                      </h4>
                      <span className="text-[10px] font-medium opacity-90">
                        {isKurdish ? 'شانشینی خۆت دابمەزرێنە' : 'Forge your own independent realm'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playFanfare();
                        onDeclareKingdom('شانشینی سەروەری نوێ', 'New Sovereign Realm');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-slate-950 text-amber-300 font-black hover:bg-slate-900 cursor-pointer shadow-md shrink-0"
                    >
                      {isKurdish ? 'تاج لەسەرنان' : 'Crown Me'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
