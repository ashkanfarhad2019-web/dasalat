/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerCharacter, Settlement } from '../types/game';
import { TROOP_UNITS, UPGRADEABLE_EQUIPMENT } from '../data/worldData';
import {
  User,
  Shield,
  Castle,
  Factory,
  ChevronUp,
  Swords,
  Coins,
  Check,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CharacterSheetModalProps {
  player: PlayerCharacter;
  settlements: Record<string, Settlement>;
  isKurdish: boolean;
  onUpgradeTroop: (troopId: string) => void;
  onBuyEquipment: (category: 'weapons' | 'shields' | 'armors' | 'horses', item: any) => void;
  onClose: () => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  player,
  settlements,
  isKurdish,
  onUpgradeTroop,
  onBuyEquipment,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'troops' | 'armory' | 'fiefs'>('armory');

  const ranks = [
    { id: 'humble', nameKu: 'پەنابەری سادە', nameEn: 'Commoner' },
    { id: 'trader', nameKu: 'بازرگان', nameEn: 'Merchant' },
    { id: 'captain', nameKu: 'فەرماندە', nameEn: 'Captain' },
    { id: 'vassal', nameKu: 'میری دەربار', nameEn: 'Vassal' },
    { id: 'high_lord', nameKu: 'خاوەن قەڵا', nameEn: 'Warlord' },
    { id: 'king', nameKu: 'شای شاهان', nameEn: 'Supreme King' },
  ];

  const currentRankIdx = ranks.findIndex((r) => r.id === player.rank);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[94vh] bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-serif">{player.name}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-black bg-amber-400 text-slate-950">
                  {ranks[currentRankIdx]?.nameKu || player.rank}
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                {player.gold} {isKurdish ? 'دینار لە گیرفاندایە' : 'Dinars'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Armory, Troops, Fiefs) */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('armory');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'armory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isKurdish ? 'کڕینی چەک و زرێ' : 'Armory Shop'}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('troops');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'troops' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isKurdish ? 'بەهێزکردنی سوپا' : 'Troop Upgrades'}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('fiefs');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'fiefs' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isKurdish ? 'قەڵا و کارگە' : 'Fiefs & Income'}
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* TAB 1: ARMORY & GEAR SHOP (کڕینی شتی نوێ و بەهێزکردن) */}
          {activeTab === 'armory' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="text-amber-200">
                  {isKurdish
                    ? '💡 پارە کۆبکەرەوە و لێرە چەکی نوێ، قەڵغان، زریپۆشی پۆڵا و ئەسپی جەنگی بکڕە بۆ بەهێزکردنی کارەکتەرەکەت لە شەڕەکاندا!'
                    : 'Collect gold to purchase higher-tier swords, plate armors, and armored steeds!'}
                </span>
                <span className="font-mono font-bold text-amber-300 shrink-0">
                  {player.gold} D
                </span>
              </div>

              {/* Weapons Grid */}
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                  {isKurdish ? 'شمشێر و چەکە بەهێزەکان (Weapons):' : 'Weapons:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {UPGRADEABLE_EQUIPMENT.weapons.map((w, i) => {
                    const isOwned = player.equipment?.weapon?.nameKu === w.nameKu;
                    const canAfford = player.gold >= w.cost;

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 text-xs transition-colors ${
                          isOwned
                            ? 'bg-amber-950/50 border-amber-400'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white">{isKurdish ? w.nameKu : w.nameEn}</h4>
                            <span className="font-mono text-red-400 font-bold">+{w.attackBonus} Atk</span>
                          </div>
                          <span className="font-mono text-amber-300 text-[11px] block mt-1">
                            {w.cost} {isKurdish ? 'دینار' : 'D'}
                          </span>
                        </div>

                        {isOwned ? (
                          <span className="text-[10px] text-center font-bold text-emerald-400 py-1 bg-emerald-950/40 rounded-lg">
                            {isKurdish ? '✓ لەبەردایە' : '✓ Equipped'}
                          </span>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              soundManager.playGavelStrike();
                              onBuyEquipment('weapons', w);
                            }}
                            className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer transition-colors disabled:opacity-40"
                          >
                            {isKurdish ? 'کڕین و بەکارهێنان' : 'Purchase'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Armors Grid */}
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                  {isKurdish ? 'زریپۆشی پۆڵایین (Armor):' : 'Armors:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {UPGRADEABLE_EQUIPMENT.armors.map((a, i) => {
                    const isOwned = player.equipment?.armor?.nameKu === a.nameKu;
                    const canAfford = player.gold >= a.cost;

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 text-xs transition-colors ${
                          isOwned
                            ? 'bg-blue-950/50 border-blue-400'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white">{isKurdish ? a.nameKu : a.nameEn}</h4>
                            <span className="font-mono text-blue-400 font-bold">+{a.defenseBonus} Def</span>
                          </div>
                          <span className="font-mono text-amber-300 text-[11px] block mt-1">
                            {a.cost} {isKurdish ? 'دینار' : 'D'}
                          </span>
                        </div>

                        {isOwned ? (
                          <span className="text-[10px] text-center font-bold text-emerald-400 py-1 bg-emerald-950/40 rounded-lg">
                            {isKurdish ? '✓ لەبەردایە' : '✓ Equipped'}
                          </span>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              soundManager.playGavelStrike();
                              onBuyEquipment('armors', a);
                            }}
                            className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black cursor-pointer transition-colors disabled:opacity-40"
                          >
                            {isKurdish ? 'کڕین و بەکارهێنان' : 'Purchase'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TROOP UPGRADES */}
          {activeTab === 'troops' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                {isKurdish ? 'بەرزکردنەوەی سەربازەکان (سەربازی ئاسایی بکە بە سوارچاکی زریپۆش):' : 'Troop Trees & Upgrades:'}
              </span>

              {player.troops.map((t) => {
                const info = TROOP_UNITS[t.troopId];
                if (!info) return null;
                const nextTroop = info.nextUpgradeId ? TROOP_UNITS[info.nextUpgradeId] : null;
                const canAfford = nextTroop && player.gold >= info.upgradeCost;

                return (
                  <div
                    key={t.troopId}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-red-400 font-bold">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">
                          {isKurdish ? info.nameKu : info.nameEn}
                        </span>
                        <span className="text-slate-400 block text-[10px]">
                          Tier {info.tier} · {info.hp} HP · {info.attack} Atk
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-300">
                        {t.count} {isKurdish ? 'چەکدار' : 'men'}
                      </span>

                      {nextTroop ? (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            soundManager.playGavelStrike();
                            onUpgradeTroop(t.troopId);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>
                            {isKurdish ? `بەرزکردنەوە (${info.upgradeCost} D)` : `Upgrade (${info.upgradeCost} D)`}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded">
                          {isKurdish ? 'ئاستی باڵا' : 'Max Tier'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FIEFS & WORKSHOPS */}
          {activeTab === 'fiefs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Castle className="w-4 h-4" />
                  <span>{isKurdish ? 'قەڵا و شارەکانت (Fiefs):' : 'Your Fiefs:'}</span>
                </span>
                {player.fiefs.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {isKurdish ? 'هێشتا هیچ قەڵایەکت نییە. بە پەلاماردان یان سوێندی دڵسۆزی لە پاشا وەریبگرە.' : 'No fiefs held currently.'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {player.fiefs.map((fId) => (
                      <div key={fId} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold flex justify-between">
                        <span>{settlements[fId]?.nameKu || fId}</span>
                        <span className="text-emerald-400 font-mono">+{settlements[fId]?.taxYield || 150} D</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Factory className="w-4 h-4" />
                  <span>{isKurdish ? 'کارگە و پیشەسازییەکانت:' : 'Your Workshops:'}</span>
                </span>
                {player.workshops.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {isKurdish ? 'لە شارەکاندا کارگە بکڕە بۆ دەستکەوتنی داهاتی هەفتانەی خۆکار.' : 'Buy workshops in cities for passive income.'}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {player.workshops.map((w) => (
                      <div key={w.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold flex justify-between">
                        <span>{isKurdish ? w.nameKu : w.nameEn}</span>
                        <span className="text-emerald-400 font-mono">+{w.weeklyIncome} D</span>
                      </div>
                    ))}
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
