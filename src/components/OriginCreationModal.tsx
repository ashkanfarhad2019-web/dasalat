/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CharacterOrigin } from '../types/game';
import { soundManager } from '../audio/soundManager';
import {
  Compass,
  Coins,
  Shield,
  Crown,
  Play,
  RotateCcw,
  User,
  ChevronRight,
} from 'lucide-react';

interface OriginCreationModalProps {
  isKurdish: boolean;
  onComplete: (name: string, origin: CharacterOrigin) => void;
  hasSavedGame: boolean;
  onLoadSavedGame: () => void;
}

export const OriginCreationModal: React.FC<OriginCreationModalProps> = ({
  isKurdish,
  onComplete,
  hasSavedGame,
  onLoadSavedGame,
}) => {
  const [name, setName] = useState('ئارام');
  const [selectedOrigin, setSelectedOrigin] = useState<CharacterOrigin>('vagabond');

  const origins = [
    {
      id: 'vagabond' as CharacterOrigin,
      icon: Compass,
      titleKu: 'پەنابەری سادە (Vagabond)',
      titleEn: 'Humble Vagabond',
      descKu: 'لە کەسێکی تەواو سادە و کەمینەوە دەستپێبکە بە ٨٠ دینار و کەوانێکی ڕاو.',
      descEn: 'Start with 80 Dinars, bow, and 2 peasant levies.',
    },
    {
      id: 'merchant' as CharacterOrigin,
      icon: Coins,
      titleKu: 'شاگردی بازرگان (Merchant)',
      titleEn: 'Merchant Apprentice',
      descKu: 'بە ٤٥٠ دینار و کاروانێک لە گەنم و ئاوریشم، ئامادە بۆ قازانجکردن لە شارەکاندا.',
      descEn: 'Start with 450 Dinars, pack mule, and silk cargo in Baghdad.',
    },
    {
      id: 'mercenary' as CharacterOrigin,
      icon: Shield,
      titleKu: 'چەکداری بەکرێگیراو (Mercenary)',
      titleEn: 'Sellsword Captain',
      descKu: 'بە ٢٢٠ دینار، زریپۆش، و ٨ پیادەی قەڵغاندار بۆ بەرپەرچدانەوەی دوژمنان.',
      descEn: 'Start with 220 Dinars, armor, and 8 infantry at Piramagrun.',
    },
    {
      id: 'noble' as CharacterOrigin,
      icon: Crown,
      titleKu: 'میرزادەی هەڵهاتوو (Fallen Noble)',
      titleEn: 'Fallen Noble Heir',
      descKu: 'بە ئەسپێکی سوارچاکی، ئەڵقەی بنەماڵە، و متمانەی بەرز لە دەرباری پاشاکاندا.',
      descEn: 'Start with courser steed, high renown, and court ties in Hewler.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    soundManager.playGavelStrike();
    onComplete(name.trim(), selectedOrigin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-950/92 pointer-events-auto select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 my-auto animate-in zoom-in-95 duration-200 max-h-[96vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white font-serif">
                {isKurdish ? 'سەرەتای فەرمانڕەوایی: لە کەسێکی سادەوە بۆ پاشا' : 'From Humble Beginnings to Supreme King'}
              </h2>
              <span className="text-[10px] text-amber-300/80 block">
                {isKurdish ? 'شێوازی Steel & Flesh لەسەر بۆردی مۆبایل' : 'Steel & Flesh Mobile Landscape Wargame'}
              </span>
            </div>
          </div>

          {/* Load Saved Game Button if available */}
          {hasSavedGame && (
            <button
              onClick={() => {
                soundManager.playGavelStrike();
                onLoadSavedGame();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isKurdish ? 'بەردەوامبوون (Load)' : 'Continue Save'}</span>
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 md:p-4 space-y-3 overflow-y-auto">
          {/* Name Input */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-300 uppercase shrink-0">
              {isKurdish ? 'ناوی کارەکتەر:' : 'Name:'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
              placeholder={isKurdish ? 'ناوی خۆت بنووسە...' : 'Your name...'}
              required
            />
          </div>

          {/* Origin Selection Grid (Compact for landscape mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {origins.map((orig) => {
              const Icon = orig.icon;
              const isSelected = selectedOrigin === orig.id;
              return (
                <button
                  key={orig.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedOrigin(orig.id);
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {isKurdish ? orig.titleKu : orig.titleEn}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {isKurdish ? orig.descKu : orig.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">
              {isKurdish ? 'مۆبایلەکەت بە ئاسۆیی (Landscape) بگرە بۆ دیمەنی فراوانتر' : 'Turn phone landscape for best view'}
            </span>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isKurdish ? 'دەستپێکردنی یاری' : 'Start Wargame'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
