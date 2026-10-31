/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BoardGameState,
  CharacterOrigin,
  CharacterRank,
  Settlement,
  BattleState,
  Workshop,
} from './types/game';
import {
  KINGDOMS,
  INITIAL_SETTLEMENTS,
  INITIAL_LORDS,
  TRADE_GOODS,
  TROOP_UNITS,
  INITIAL_EQUIPMENT,
} from './data/worldData';
import { soundManager } from './audio/soundManager';
import { ThreeCanvas } from './components/ThreeCanvas';
import { OriginCreationModal } from './components/OriginCreationModal';
import { TopBoardBar } from './components/TopBoardBar';
import { BottomBoardDock } from './components/BottomBoardDock';
import { SettlementViewModal } from './components/SettlementViewModal';
import { TradeModal } from './components/TradeModal';
import { KingdomPoliticsModal } from './components/KingdomPoliticsModal';
import { BattleModal } from './components/BattleModal';
import { RecruitmentModal } from './components/RecruitmentModal';
import { WorkshopsModal } from './components/WorkshopsModal';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { BoardCameraPreset, BoardScene } from './three/BoardScene';

const SAVE_KEY = 'deselat_steel_flesh_save_v2';

export default function App() {
  const [boardScene, setBoardScene] = useState<BoardScene | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const [gameState, setGameState] = useState<BoardGameState>(() => {
    return {
      day: 1,
      player: {
        name: 'ئارام',
        origin: 'vagabond',
        rank: 'humble',
        gold: 80,
        renown: 10,
        honor: 15,
        influence: 20,
        partyLimit: 25,
        inventoryLimit: 50,
        currentDay: 1,
        allegiance: null,
        fiefs: [],
        workshops: [],
        troops: [{ troopId: 'recruit', count: 2 }],
        inventory: [{ goodId: 'bread', quantity: 3, boughtPrice: 20 }],
        equipment: JSON.parse(JSON.stringify(INITIAL_EQUIPMENT)),
        worldPosition: { x: -1.0, z: 5.0 }, // Sharazur
      },
      kingdoms: JSON.parse(JSON.stringify(KINGDOMS)),
      settlements: JSON.parse(JSON.stringify(INITIAL_SETTLEMENTS)),
      lords: JSON.parse(JSON.stringify(INITIAL_LORDS)),
      roamingParties: [],
      activeSettlement: null,
      activeBattle: null,
      gamePhase: 'intro',
      lang: 'ku',
      soundMuted: false,
      cameraPreset: 'board',
    };
  });

  const [activeSubModal, setActiveSubModal] = useState<
    'none' | 'trade' | 'recruitment' | 'workshops' | 'politics' | 'character_sheet'
  >('none');
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Check saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        setHasSavedGame(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save Game Function
  const handleSaveGame = () => {
    try {
      const dataToSave = {
        ...gameState,
        gamePhase: 'board', // restore to board
        activeSettlement: null,
        activeBattle: null,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      setHasSavedGame(true);
    } catch (err) {
      console.error('Failed to save game:', err);
    }
  };

  // Load Saved Game
  const handleLoadSavedGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const loadedState = JSON.parse(saved) as BoardGameState;
        setGameState(loadedState);
        soundManager.startAmbient();
        if (boardScene) {
          boardScene.updatePlayerPosition(
            loadedState.player.worldPosition.x,
            loadedState.player.worldPosition.z
          );
        }
      }
    } catch (err) {
      console.error('Failed to load save:', err);
    }
  };

  // 1. Complete Character Origin
  const handleCompleteOrigin = (name: string, origin: CharacterOrigin) => {
    setGameState((prev) => {
      let initialGold = 80;
      let initialTroops = [{ troopId: 'recruit', count: 2 }];
      let initialInventory = [{ goodId: 'bread', quantity: 4, boughtPrice: 20 }];
      let initialPos = { x: -1.0, z: 5.0 }; // Sharazur
      let initialRenown = 10;
      let initialRank: CharacterRank = 'humble';

      if (origin === 'merchant') {
        initialGold = 450;
        initialRank = 'trader';
        initialRenown = 25;
        initialTroops = [
          { troopId: 'recruit', count: 2 },
          { troopId: 'footman', count: 3 },
        ];
        initialInventory = [
          { goodId: 'grain', quantity: 6, boughtPrice: 15 },
          { goodId: 'silk', quantity: 2, boughtPrice: 170 },
          { goodId: 'bread', quantity: 4, boughtPrice: 25 },
        ];
        initialPos = { x: 4.5, z: -1.5 }; // Baghdad
      } else if (origin === 'mercenary') {
        initialGold = 220;
        initialRank = 'captain';
        initialRenown = 40;
        initialTroops = [
          { troopId: 'footman', count: 5 },
          { troopId: 'archer', count: 3 },
        ];
        initialInventory = [
          { goodId: 'bread', quantity: 5, boughtPrice: 20 },
          { goodId: 'swords', quantity: 1, boughtPrice: 130 },
        ];
        initialPos = { x: -7.0, z: 1.5 }; // Piramagrun
      } else if (origin === 'noble') {
        initialGold = 180;
        initialRank = 'humble';
        initialRenown = 60;
        initialTroops = [
          { troopId: 'footman', count: 3 },
          { troopId: 'cavalry_rider', count: 2 },
        ];
        initialInventory = [
          { goodId: 'bread', quantity: 5, boughtPrice: 20 },
          { goodId: 'horses', quantity: 1, boughtPrice: 280 },
        ];
        initialPos = { x: -4.0, z: -2.5 }; // Hewler
      }

      return {
        ...prev,
        gamePhase: 'board',
        player: {
          ...prev.player,
          name,
          origin,
          rank: initialRank,
          gold: initialGold,
          renown: initialRenown,
          troops: initialTroops,
          inventory: initialInventory,
          worldPosition: initialPos,
        },
      };
    });

    soundManager.startAmbient();
  };

  // 2. Settlement Click from 3D Board
  const handleSettlementClick = (settlementId: string) => {
    const s = gameState.settlements[settlementId];
    if (!s) return;

    soundManager.playClick();
    if (boardScene) {
      boardScene.focusSettlement(settlementId);
    }

    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        worldPosition: { x: s.boardX, z: s.boardZ },
      },
      activeSettlement: s,
      gamePhase: 'settlement',
    }));
  };

  // Board terrain click
  const handleBoardClick = (x: number, z: number) => {
    soundManager.playClick();
    if (boardScene) {
      boardScene.setDestinationMarker(x, z, true);
    }
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        worldPosition: { x, z },
      },
      activeSettlement: null,
      gamePhase: 'board',
    }));
  };

  // 3. Advance Day
  const handleAdvanceDay = () => {
    soundManager.playCoins();

    setGameState((prev) => {
      const nextDay = prev.day + 1;

      // Troop wages
      const totalWages = prev.player.troops.reduce((acc, t) => {
        const u = TROOP_UNITS[t.troopId];
        return acc + (u ? u.wage * t.count : 2);
      }, 0);

      // Weekly workshop income (every 7 days)
      let workshopIncome = 0;
      if (nextDay % 7 === 0) {
        workshopIncome = prev.player.workshops.reduce((acc, w) => acc + w.weeklyIncome, 0);
      }

      // Fief tax yields (every 7 days)
      let fiefTaxes = 0;
      if (nextDay % 7 === 0) {
        fiefTaxes = prev.player.fiefs.reduce((acc, fId) => {
          const s = prev.settlements[fId];
          return acc + (s ? s.taxYield : 120);
        }, 0);
      }

      const newGold = Math.max(0, prev.player.gold - totalWages + workshopIncome + fiefTaxes);

      // Rank progression check
      let newRank = prev.player.rank;
      if (newRank === 'humble' && (newGold >= 400 || prev.player.inventory.length >= 4)) {
        newRank = 'trader';
      }
      const troopCount = prev.player.troops.reduce((a, b) => a + b.count, 0);
      if ((newRank === 'humble' || newRank === 'trader') && troopCount >= 10 && prev.player.renown >= 40) {
        newRank = 'captain';
      }
      if (prev.player.allegiance && (newRank === 'humble' || newRank === 'trader' || newRank === 'captain')) {
        newRank = 'vassal';
      }
      if (prev.player.fiefs.length > 0 && newRank !== 'king') {
        newRank = 'high_lord';
      }

      // Random Road Ambush Encounter (10% chance)
      let triggeredBattle: BattleState | null = null;
      if (prev.gamePhase === 'board' && Math.random() < 0.12 && prev.day > 2) {
        soundManager.playCrisisWarning();
        triggeredBattle = {
          enemyNameKu: 'ڕێگر و چەتەکانی ڕێگای ئاوریشم',
          enemyNameEn: 'Silk Road Desert Bandits',
          enemyType: 'bandits',
          enemyTroops: [
            { nameKu: 'چەتەی چەکدار', count: 6, hp: 45 },
            { nameKu: 'کەوانداری یاخی', count: 4, hp: 35 },
          ],
          playerTroops: prev.player.troops.map((t) => {
            const u = TROOP_UNITS[t.troopId];
            return {
              nameKu: u ? u.nameKu : 'سەرباز',
              count: t.count,
              hp: u ? u.hp : 50,
            };
          }),
          turn: 1,
          log: [
            prev.lang === 'ku'
              ? 'چەتەکان لە پشت بەردەکانەوە پەلاماری کاروانەکەت دەدەن!'
              : 'Bandits sprang from ambush to pillage your party!',
          ],
          battlePhase: 'tactics',
          lootGold: 160,
          lootRenown: 18,
        };
      }

      return {
        ...prev,
        day: nextDay,
        player: {
          ...prev.player,
          gold: newGold,
          rank: newRank,
          currentDay: nextDay,
        },
        activeBattle: triggeredBattle,
        gamePhase: triggeredBattle ? 'battle' : prev.gamePhase,
      };
    });

    // Auto-save progress
    setTimeout(() => {
      handleSaveGame();
    }, 100);
  };

  // 4. Trade Actions
  const handleBuyItem = (goodId: string, quantity: number, price: number) => {
    setGameState((prev) => {
      if (prev.player.gold < price) return prev;
      const existing = prev.player.inventory.find((i) => i.goodId === goodId);
      let updatedInventory = [];
      if (existing) {
        updatedInventory = prev.player.inventory.map((i) =>
          i.goodId === goodId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updatedInventory = [
          ...prev.player.inventory,
          { goodId, quantity, boughtPrice: price },
        ];
      }
      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - price,
          inventory: updatedInventory,
        },
      };
    });
  };

  const handleSellItem = (goodId: string, quantity: number, price: number) => {
    setGameState((prev) => {
      const existing = prev.player.inventory.find((i) => i.goodId === goodId);
      if (!existing || existing.quantity < quantity) return prev;

      let updatedInventory = [];
      if (existing.quantity <= quantity) {
        updatedInventory = prev.player.inventory.filter((i) => i.goodId !== goodId);
      } else {
        updatedInventory = prev.player.inventory.map((i) =>
          i.goodId === goodId ? { ...i, quantity: i.quantity - quantity } : i
        );
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold + price,
          inventory: updatedInventory,
        },
      };
    });
  };

  // 5. Recruitment
  const handleHireTroop = (troopId: string, count: number, cost: number) => {
    setGameState((prev) => {
      if (prev.player.gold < cost) return prev;
      const existing = prev.player.troops.find((t) => t.troopId === troopId);
      let updatedTroops = [];
      if (existing) {
        updatedTroops = prev.player.troops.map((t) =>
          t.troopId === troopId ? { ...t, count: t.count + count } : t
        );
      } else {
        updatedTroops = [...prev.player.troops, { troopId, count }];
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - cost,
          troops: updatedTroops,
        },
      };
    });
  };

  // Upgrade troop unit
  const handleUpgradeTroop = (troopId: string) => {
    const currentUnit = TROOP_UNITS[troopId];
    if (!currentUnit || !currentUnit.nextUpgradeId) return;
    const nextUnitId = currentUnit.nextUpgradeId;

    setGameState((prev) => {
      if (prev.player.gold < currentUnit.upgradeCost) return prev;
      const targetTroop = prev.player.troops.find((t) => t.troopId === troopId);
      if (!targetTroop || targetTroop.count < 1) return prev;

      let updatedTroops = prev.player.troops
        .map((t) => (t.troopId === troopId ? { ...t, count: t.count - 1 } : t))
        .filter((t) => t.count > 0);

      const existingNext = updatedTroops.find((t) => t.troopId === nextUnitId);
      if (existingNext) {
        updatedTroops = updatedTroops.map((t) =>
          t.troopId === nextUnitId ? { ...t, count: t.count + 1 } : t
        );
      } else {
        updatedTroops.push({ troopId: nextUnitId, count: 1 });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - currentUnit.upgradeCost,
          troops: updatedTroops,
          renown: prev.player.renown + 5,
        },
      };
    });
  };

  // Buy Equipment Armory Gear (Upgrades for player)
  const handleBuyEquipment = (
    category: 'weapons' | 'shields' | 'armors' | 'horses',
    item: any
  ) => {
    setGameState((prev) => {
      if (prev.player.gold < item.cost) return prev;
      const newEquip = { ...prev.player.equipment };
      if (category === 'weapons') {
        newEquip.weapon = { ...item, owned: true };
      } else if (category === 'shields') {
        newEquip.shield = { ...item, owned: true };
      } else if (category === 'armors') {
        newEquip.armor = { ...item, owned: true };
      } else if (category === 'horses') {
        newEquip.horse = { ...item, owned: true };
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - item.cost,
          equipment: newEquip,
          renown: prev.player.renown + 10,
        },
      };
    });
  };

  // 6. Buy Workshop
  const handleBuyWorkshop = (type: Workshop['type'], cost: number, income: number) => {
    if (!gameState.activeSettlement) return;
    const settlementId = gameState.activeSettlement.id;

    setGameState((prev) => {
      if (prev.player.gold < cost) return prev;
      const newWs: Workshop = {
        id: `ws_${Date.now()}`,
        settlementId,
        type,
        nameKu: `کارگەی ${prev.activeSettlement?.nameKu}`,
        nameEn: `${prev.activeSettlement?.nameEn} Guild Workshop`,
        weeklyIncome: income,
        cost,
      };

      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - cost,
          workshops: [...prev.player.workshops, newWs],
        },
      };
    });
  };

  // 7. Feudal Politics Actions
  const handleSwearFealty = (kingdomId: string) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        allegiance: kingdomId,
        rank: 'vassal',
        influence: prev.player.influence + 80,
      },
    }));
  };

  const handleBribeLord = (lordId: string) => {
    setGameState((prev) => {
      if (prev.player.gold < 300) return prev;
      const updatedLords = { ...prev.lords };
      updatedLords[lordId] = {
        ...updatedLords[lordId],
        relationWithPlayer: Math.min(100, updatedLords[lordId].relationWithPlayer + 25),
      };
      return {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - 300,
        },
        lords: updatedLords,
      };
    });
  };

  const handleBlackmailLord = (lordId: string) => {
    setGameState((prev) => {
      const updatedLords = { ...prev.lords };
      updatedLords[lordId] = {
        ...updatedLords[lordId],
        influence: Math.max(0, updatedLords[lordId].influence - 50),
      };
      return {
        ...prev,
        player: {
          ...prev.player,
          influence: prev.player.influence + 45,
        },
        lords: updatedLords,
      };
    });
  };

  // Declare Independence and Crown Self King
  const handleDeclareKingdom = (realmNameKu: string, realmNameEn: string) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        rank: 'king',
        allegiance: 'player_realm',
        renown: prev.player.renown + 250,
      },
    }));
    setActiveSubModal('none');
  };

  // 8. Siege / Assault Castle
  const handleBesiegeSettlement = () => {
    if (!gameState.activeSettlement) return;
    const s = gameState.activeSettlement;

    const garrisonCount = Math.min(40, Math.round(s.garrison / 6));
    setGameState((prev) => ({
      ...prev,
      gamePhase: 'battle',
      activeBattle: {
        enemyNameKu: `پاسەوانانی قەڵای ${s.nameKu}`,
        enemyNameEn: `Garrison of ${s.nameEn}`,
        enemyType: 'garrison',
        enemyTroops: [
          { nameKu: 'پیادەی قەڵا', count: Math.round(garrisonCount * 0.6), hp: 70 },
          { nameKu: 'کەوانداری سەربازگە', count: Math.round(garrisonCount * 0.4), hp: 50 },
        ],
        playerTroops: prev.player.troops.map((t) => {
          const u = TROOP_UNITS[t.troopId];
          return {
            nameKu: u ? u.nameKu : 'سەرباز',
            count: t.count,
            hp: u ? u.hp : 60,
          };
        }),
        turn: 1,
        log: [
          prev.lang === 'ku'
            ? `سوپاکەت دەستی بە هێرشی پەلاماردانی دیواری قەڵای ${s.nameKu} کرد!`
            : `Assault ladders placed against the walls of ${s.nameEn}!`,
        ],
        battlePhase: 'tactics',
        lootGold: 650,
        lootRenown: 60,
      },
    }));
  };

  // Tactical battle execution
  const handleExecuteTactic = (tactic: 'shieldwall' | 'charge' | 'volley' | 'flank') => {
    setGameState((prev) => {
      if (!prev.activeBattle) return prev;
      const b = { ...prev.activeBattle };
      b.turn += 1;

      // Bonus attack from player's weapon & armor
      const bonusAtk = prev.player.equipment?.weapon?.attackBonus || 0;
      const bonusDef =
        (prev.player.equipment?.armor?.defenseBonus || 0) +
        (prev.player.equipment?.shield?.defenseBonus || 0);

      let pDamage = 35 + bonusAtk + Math.round(Math.random() * 30);
      let eDamage = Math.max(5, 25 - Math.round(bonusDef / 4) + Math.round(Math.random() * 25));
      let msgKu = '';

      if (tactic === 'shieldwall') {
        eDamage = Math.round(eDamage * 0.4);
        msgKu = 'دیواری قەڵغان بەسترا: زیانی دوژمن بە توندی کەمکرایەوە!';
      } else if (tactic === 'charge') {
        pDamage = Math.round(pDamage * 1.5);
        eDamage = Math.round(eDamage * 1.3);
        msgKu = 'هێرشی دەستبەجێ: شمشێرەکان بە توندی بەریەککەوتن!';
      } else if (tactic === 'volley') {
        pDamage = Math.round(pDamage * 1.2);
        msgKu = 'بارانی تیر: تیرهاوێژەکان لە دوورەوە لێدانی کوشندەیان ئەنجامدا!';
      } else if (tactic === 'flank') {
        pDamage = Math.round(pDamage * 1.6);
        msgKu = 'دەورگرتنی سوارچاکان: باڵی چەپی دوژمن تێکشکێنرا!';
      }

      b.enemyTroops = b.enemyTroops
        .map((t) => ({ ...t, count: Math.max(0, t.count - Math.round(pDamage / 25)) }))
        .filter((t) => t.count > 0);

      b.playerTroops = b.playerTroops
        .map((t) => ({ ...t, count: Math.max(0, t.count - Math.round(eDamage / 35)) }))
        .filter((t) => t.count > 0);

      b.log = [msgKu, ...b.log];

      const enemyLeft = b.enemyTroops.reduce((a, b) => a + b.count, 0);
      const playerLeft = b.playerTroops.reduce((a, b) => a + b.count, 0);

      if (enemyLeft <= 0) {
        b.battlePhase = 'resolved';
        b.winner = 'player';
      } else if (playerLeft <= 0) {
        b.battlePhase = 'resolved';
        b.winner = 'enemy';
      }

      return {
        ...prev,
        activeBattle: b,
      };
    });
  };

  // Conclude battle
  const handleFinishBattle = (victory: boolean) => {
    setGameState((prev) => {
      let updatedPlayer = { ...prev.player };
      let updatedSettlements = { ...prev.settlements };

      if (victory && prev.activeBattle) {
        updatedPlayer.gold += prev.activeBattle.lootGold;
        updatedPlayer.renown += prev.activeBattle.lootRenown;

        // If siege victory, claim fief
        if (prev.activeBattle.enemyType === 'garrison' && prev.activeSettlement) {
          const sId = prev.activeSettlement.id;
          if (!updatedPlayer.fiefs.includes(sId)) {
            updatedPlayer.fiefs.push(sId);
            updatedPlayer.rank = updatedPlayer.rank === 'king' ? 'king' : 'high_lord';
            updatedSettlements[sId] = {
              ...updatedSettlements[sId],
              ownerLordId: 'player',
            };
          }
        }
      }

      return {
        ...prev,
        player: updatedPlayer,
        settlements: updatedSettlements,
        activeBattle: null,
        gamePhase: 'board',
      };
    });

    handleSaveGame();
  };

  // Global Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((c) => !c);
      } else if (e.key === 'm' || e.key === 'M') {
        soundManager.setMuted(!gameState.soundMuted);
        setGameState((p) => ({ ...p, soundMuted: !p.soundMuted }));
      } else if (e.key === '1') {
        setGameState((p) => ({ ...p, cameraPreset: 'board' }));
      } else if (e.key === '2') {
        setGameState((p) => ({ ...p, cameraPreset: 'tactical' }));
      } else if (e.key === '3') {
        setGameState((p) => ({ ...p, cameraPreset: 'close' }));
      } else if (e.key === '4') {
        setGameState((p) => ({ ...p, cameraPreset: 'overview' }));
      } else if (e.key === 'Escape') {
        setActiveSubModal('none');
        if (gameState.gamePhase === 'settlement') {
          setGameState((p) => ({ ...p, gamePhase: 'board' }));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.soundMuted, gameState.gamePhase]);

  const isKurdish = gameState.lang === 'ku';

  return (
    <div
      dir={isKurdish ? 'rtl' : 'ltr'}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none touch-manipulation"
    >
      {/* 1. 3D Strategic War Board Viewport */}
      <ThreeCanvas
        settlements={gameState.settlements}
        playerPos={gameState.player.worldPosition}
        cameraPreset={gameState.cameraPreset}
        onSettlementClick={handleSettlementClick}
        onBoardClick={handleBoardClick}
        onSceneReady={(scene) => setBoardScene(scene)}
      />

      {/* 2. Character Creation Origin Screen */}
      {gameState.gamePhase === 'intro' && (
        <OriginCreationModal
          isKurdish={isKurdish}
          onComplete={handleCompleteOrigin}
          hasSavedGame={hasSavedGame}
          onLoadSavedGame={handleLoadSavedGame}
        />
      )}

      {/* 3. In-Game HUD (Top Bar & Bottom Dock) */}
      {gameState.gamePhase !== 'intro' && (
        <>
          <TopBoardBar
            player={gameState.player}
            isKurdish={isKurdish}
            onAdvanceDay={handleAdvanceDay}
            onOpenCharacterSheet={() => setActiveSubModal('character_sheet')}
            onSaveGame={handleSaveGame}
          />

          <BottomBoardDock
            onOpenCharacterSheet={() => setActiveSubModal('character_sheet')}
            onOpenPolitics={() => setActiveSubModal('politics')}
            cameraPreset={gameState.cameraPreset}
            onSelectCamera={(preset) => setGameState((p) => ({ ...p, cameraPreset: preset }))}
            isCollapsed={dockCollapsed}
            onToggleCollapse={() => setDockCollapsed((c) => !c)}
            isKurdish={isKurdish}
            onToggleLang={() =>
              setGameState((p) => ({ ...p, lang: p.lang === 'ku' ? 'en' : 'ku' }))
            }
            soundMuted={gameState.soundMuted}
            onToggleSound={() => {
              soundManager.setMuted(!gameState.soundMuted);
              setGameState((p) => ({ ...p, soundMuted: !p.soundMuted }));
            }}
          />
        </>
      )}

      {/* 4. Active Settlement View Modal */}
      {gameState.gamePhase === 'settlement' && gameState.activeSettlement && (
        <SettlementViewModal
          settlement={gameState.activeSettlement}
          kingdom={gameState.kingdoms[gameState.activeSettlement.kingdomId]}
          ownerLord={gameState.lords[gameState.activeSettlement.ownerLordId]}
          player={gameState.player}
          isKurdish={isKurdish}
          onOpenTrade={() => setActiveSubModal('trade')}
          onRecruitTroops={() => setActiveSubModal('recruitment')}
          onVisitLord={() => setActiveSubModal('politics')}
          onOpenWorkshops={() => setActiveSubModal('workshops')}
          onBesiege={handleBesiegeSettlement}
          onLeave={() => setGameState((p) => ({ ...p, gamePhase: 'board' }))}
        />
      )}

      {/* 5. Trade Modal */}
      {activeSubModal === 'trade' && gameState.activeSettlement && (
        <TradeModal
          settlement={gameState.activeSettlement}
          player={gameState.player}
          isKurdish={isKurdish}
          onBuyItem={handleBuyItem}
          onSellItem={handleSellItem}
          onClose={() => setActiveSubModal('none')}
        />
      )}

      {/* 6. Recruitment Modal */}
      {activeSubModal === 'recruitment' && gameState.activeSettlement && (
        <RecruitmentModal
          settlement={gameState.activeSettlement}
          player={gameState.player}
          isKurdish={isKurdish}
          onHireTroop={handleHireTroop}
          onClose={() => setActiveSubModal('none')}
        />
      )}

      {/* 7. Workshops / Enterprises Modal */}
      {activeSubModal === 'workshops' && gameState.activeSettlement && (
        <WorkshopsModal
          settlement={gameState.activeSettlement}
          player={gameState.player}
          isKurdish={isKurdish}
          onBuyWorkshop={handleBuyWorkshop}
          onClose={() => setActiveSubModal('none')}
        />
      )}

      {/* 8. Feudal Politics Modal */}
      {activeSubModal === 'politics' && (
        <KingdomPoliticsModal
          kingdoms={gameState.kingdoms}
          lords={gameState.lords}
          settlements={gameState.settlements}
          player={gameState.player}
          isKurdish={isKurdish}
          onSwearFealty={handleSwearFealty}
          onDeclareKingdom={handleDeclareKingdom}
          onBribeLord={handleBribeLord}
          onBlackmailLord={handleBlackmailLord}
          onClose={() => setActiveSubModal('none')}
        />
      )}

      {/* 9. Character Sheet & Equipment Armory Modal */}
      {activeSubModal === 'character_sheet' && (
        <CharacterSheetModal
          player={gameState.player}
          settlements={gameState.settlements}
          isKurdish={isKurdish}
          onUpgradeTroop={handleUpgradeTroop}
          onBuyEquipment={handleBuyEquipment}
          onClose={() => setActiveSubModal('none')}
        />
      )}

      {/* 10. Tactical Battle Modal */}
      {gameState.gamePhase === 'battle' && gameState.activeBattle && (
        <BattleModal
          battle={gameState.activeBattle}
          player={gameState.player}
          isKurdish={isKurdish}
          onExecuteTactic={handleExecuteTactic}
          onFinishBattle={handleFinishBattle}
        />
      )}
    </div>
  );
}
