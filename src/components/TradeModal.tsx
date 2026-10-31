/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settlement, PlayerCharacter } from '../types/game';
import { TRADE_GOODS } from '../data/worldData';
import { Store, Coins, Package, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TradeModalProps {
  settlement: Settlement;
  player: PlayerCharacter;
  isKurdish: boolean;
  onBuyItem: (goodId: string, quantity: number, price: number) => void;
  onSellItem: (goodId: string, quantity: number, price: number) => void;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  settlement,
  player,
  isKurdish,
  onBuyItem,
  onSellItem,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 pointer-events-auto select-none">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-amber-200">
                {isKurdish ? `بازاڕ: ${settlement.nameKu}` : `Bazaar: ${settlement.nameEn}`}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-xl font-mono text-amber-200 text-xs font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{player.gold} D</span>
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
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-2 overflow-hidden">
          {/* City Goods Column */}
          <div className="p-3 border-r border-slate-800 overflow-y-auto space-y-1.5 bg-slate-950/40">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
              {isKurdish ? 'کاڵای شار (بۆ کڕین):' : 'City Goods (Buy):'}
            </span>

            {Object.entries(settlement.marketGoods).map(([goodId, info]) => {
              const good = TRADE_GOODS[goodId];
              if (!good) return null;
              const canAfford = player.gold >= info.price;

              return (
                <div
                  key={goodId}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">
                      {isKurdish ? good.nameKu : good.nameEn}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {isKurdish ? 'مەوجوود:' : 'Stock:'} {info.stock}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      {info.price} D
                    </span>
                    <button
                      disabled={!canAfford || info.stock <= 0}
                      onClick={() => {
                        soundManager.playCoins();
                        onBuyItem(goodId, 1, info.price);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-40"
                    >
                      {isKurdish ? 'کڕین' : 'Buy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Inventory Column */}
          <div className="p-3 overflow-y-auto space-y-1.5 bg-slate-900/60">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              {isKurdish ? 'باری تۆ (بۆ فرۆشتن):' : 'Your Cargo (Sell):'}
            </span>

            {player.inventory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {isKurdish ? 'بارت بەتاڵە' : 'Cargo is empty'}
              </div>
            ) : (
              player.inventory.map((item) => {
                const good = TRADE_GOODS[item.goodId];
                if (!good) return null;
                const sellPrice =
                  settlement.marketGoods[item.goodId]?.price || Math.round(good.basePrice * 0.9);
                const profit = item.boughtPrice ? sellPrice - item.boughtPrice : 0;

                return (
                  <div
                    key={item.goodId}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-xs">
                        {isKurdish ? good.nameKu : good.nameEn}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        x{item.quantity}{' '}
                        {profit !== 0 && (
                          <span className={profit > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            ({profit > 0 ? '+' : ''}{profit} D)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-300 text-xs">
                        {sellPrice} D
                      </span>
                      <button
                        onClick={() => {
                          soundManager.playCoins();
                          onSellItem(item.goodId, 1, sellPrice);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                      >
                        {isKurdish ? 'فرۆشتن' : 'Sell'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
