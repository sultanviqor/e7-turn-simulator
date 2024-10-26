import React, { useState, useMemo, useCallback } from "react";

const BUFF_TYPES = {
  SPEED: "Speed Buff",
  RAGE: "Rage Buff",
  REVENGE: "Revenge Set",
  SPEED_BONUS: "Speed Bonus",
};

const DEBUFF_TYPES = {
  SPEED_DOWN: "Speed Debuff",
};

const calculateSpeedBonuses = (unit) => {
  const revengeSpeedBonus = unit.buffs.includes(BUFF_TYPES.REVENGE)
    ? (100 - unit.currentHP) * 0.5
    : 0;

  const missingHPSpeedBonus = unit.buffs.includes(BUFF_TYPES.SPEED_BONUS)
    ? (unit.baseSpeed *
        (unit.speedBonusPercent / 100) *
        (100 - unit.currentHP)) /
      100
    : 0;

  return { revengeSpeedBonus, missingHPSpeedBonus };
};

const calculateTotalSpeed = (unit) => {
  const { revengeSpeedBonus, missingHPSpeedBonus } =
    calculateSpeedBonuses(unit);
  return unit.currentSpeed + revengeSpeedBonus + missingHPSpeedBonus;
};

const BuffIcon = React.memo(({ type }) => {
  const colorMap = {
    "Speed Buff": "bg-blue-500",
    "Rage Buff": "bg-red-500",
    "Speed Debuff": "bg-yellow-500",
    "Revenge Set": "bg-purple-500",
    "Speed Bonus": "bg-orange-500",
  };

  return (
    <div className="group relative inline-block">
      <span
        className={`${
          colorMap[type] || "bg-gray-500"
        } w-4 h-4 rounded-full inline-block mr-1 transform transition-transform`}
      />
      <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded text-xs whitespace-nowrap">
        {type}
      </span>
    </div>
  );
});

const UnitStats = ({ unit }) => {
  const revengeBonus = unit.buffs.includes("Revenge Set")
    ? (100 - unit.currentHP) * 0.5
    : 0;
  const speedBonus = unit.buffs.includes("Speed Bonus")
    ? (unit.baseSpeed *
        (unit.speedBonusPercent / 100) *
        (100 - unit.currentHP)) /
      100
    : 0;

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="bg-gray-700 p-2 rounded">
        <div className="text-xs text-gray-400">Base Speed</div>
        <div className="text-lg font-bold">{unit.baseSpeed}</div>
      </div>
      <div className="bg-gray-700 p-2 rounded">
        <div className="text-xs text-gray-400">Current Speed</div>
        <div className="text-lg font-bold">
          {Math.round(unit.currentSpeed + revengeBonus + speedBonus)}
        </div>
      </div>
      <div className="bg-gray-700 p-2 rounded">
        <div className="text-xs text-gray-400">Combat Readiness</div>
        <div className="text-lg font-bold">{unit.currentCR}%</div>
      </div>
      <div className="bg-gray-700 p-2 rounded">
        <div className="text-xs text-gray-400">Health</div>
        <div className="text-lg font-bold">{unit.currentHP}%</div>
      </div>
    </div>
  );
};

const Unit = React.memo(({ unit, isActive, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer transform ${
        isSelected
          ? "ring-2 ring-indigo-500 bg-gray-800"
          : isActive
          ? "bg-gradient-to-br from-indigo-600 to-indigo-800"
          : "bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{unit.name}</h3>
        <div className="flex space-x-1">
          {unit.buffs.map((buff) => (
            <BuffIcon key={buff} type={buff} />
          ))}
          {unit.debuffs.map((debuff) => (
            <BuffIcon key={debuff} type={debuff} />
          ))}
        </div>
      </div>
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${unit.currentCR}%` }}
          />
        </div>
      </div>
      <UnitStats unit={unit} />
    </div>
  );
});

const EffectButton = ({ isActive, onClick, label, activeColor }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? `${activeColor} text-white transform `
        : "bg-gray-700 hover:bg-gray-600"
    }`}
  >
    {label}
  </button>
);

const NumberInput = ({ label, placeholder, onSubmit, buttonColor }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex">
      <input
        type="number"
        className="w-full px-3 py-2 rounded-l bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        placeholder={placeholder}
      />
      <button
        onClick={(e) => onSubmit(parseInt(e.target.previousSibling.value, 10))}
        className={`px-4 py-2 ${buttonColor} text-white font-medium rounded-r transition-colors duration-200 hover:opacity-90`}
      >
        Set
      </button>
    </div>
  </div>
);

const UnitControls = ({
  unit,
  toggleBuff,
  toggleDebuff,
  adjustCR,
  adjustHP,
  setSpeedBonus,
}) => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-2">
      <EffectButton
        isActive={unit.buffs.includes(BUFF_TYPES.SPEED)}
        onClick={() => toggleBuff(unit.id, BUFF_TYPES.SPEED)}
        label="Speed Buff"
        activeColor="bg-blue-600"
      />
      <EffectButton
        isActive={unit.buffs.includes(BUFF_TYPES.RAGE)}
        onClick={() => toggleBuff(unit.id, BUFF_TYPES.RAGE)}
        label="Rage Buff"
        activeColor="bg-red-600"
      />
      <EffectButton
        isActive={unit.debuffs.includes(DEBUFF_TYPES.SPEED_DOWN)}
        onClick={() => toggleDebuff(unit.id, DEBUFF_TYPES.SPEED_DOWN)}
        label="Speed Debuff"
        activeColor="bg-yellow-600"
      />
      <EffectButton
        isActive={unit.buffs.includes(BUFF_TYPES.REVENGE)}
        onClick={() => toggleBuff(unit.id, BUFF_TYPES.REVENGE)}
        label="Revenge Set"
        activeColor="bg-purple-600"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <NumberInput
        placeholder="CR"
        onSubmit={(value) => adjustCR(unit.id, value)}
        buttonLabel="Set CR"
        buttonColor="bg-green-500"
      />
      <NumberInput
        placeholder="HP"
        onSubmit={(value) => adjustHP(unit.id, value)}
        buttonLabel="Set HP"
        buttonColor="bg-purple-500"
      />
      <div className="flex col-span-2">
        <input
          type="number"
          className="w-24 px-2 py-1 rounded-l text-sm bg-gray-700 text-white"
          placeholder="Speed %"
        />
        <button
          onClick={(e) =>
            setSpeedBonus(unit.id, parseInt(e.target.previousSibling.value, 10))
          }
          className="px-2 py-1 bg-orange-500 text-white text-sm rounded-r"
        >
          Set Speed Bonus %
        </button>
        <div className="px-2 mx-1 bg-gray-600 rounded cursor-help">?</div>
      </div>
    </div>
  </div>
);

const CombatLog = ({ logs }) => (
  <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
    <h2 className="text-xl font-bold mb-3 flex items-center">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
      Combat Log
    </h2>
    <div className="h-48 overflow-y-auto custom-scrollbar">
      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li
            key={index}
            className="text-sm py-2 px-3 bg-gray-700 rounded animate-fadeIn"
          >
            {log}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const useCombatSystem = () => {
  const [units, setUnits] = useState([]);
  const [turnOrder, setTurnOrder] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSpeed, setNewUnitSpeed] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  const addUnit = useCallback(() => {
    if (newUnitName && newUnitSpeed) {
      const newUnit = {
        id: Date.now(),
        name: newUnitName,
        baseSpeed: parseInt(newUnitSpeed),
        currentSpeed: parseInt(newUnitSpeed),
        currentCR: 0,
        currentHP: 100,
        speedBonusPercent: 0,
        buffs: [],
        debuffs: [],
      };
      setUnits((prevUnits) => [...prevUnits, newUnit]);
      setNewUnitName("");
      setNewUnitSpeed("");
    }
  }, [newUnitName, newUnitSpeed]);

  const applyBuffsAndDebuffs = useCallback((unit) => {
    let totalEffect = 0;
    if (unit.buffs.includes(BUFF_TYPES.SPEED)) totalEffect += 30;
    if (unit.buffs.includes(BUFF_TYPES.RAGE)) totalEffect += 20;
    if (unit.debuffs.includes(DEBUFF_TYPES.SPEED_DOWN)) totalEffect -= 30;
    return Math.round(unit.baseSpeed * (1 + totalEffect / 100));
  }, []);

  const toggleEffect = useCallback(
    (unitId, effectType, isDebuff) => {
      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (unit.id === unitId) {
            const effectArray = isDebuff ? "debuffs" : "buffs";
            const updatedEffects = unit[effectArray].includes(effectType)
              ? unit[effectArray].filter((effect) => effect !== effectType)
              : [...unit[effectArray], effectType];
            const newSpeed = applyBuffsAndDebuffs({
              ...unit,
              [effectArray]: updatedEffects,
            });
            const action = unit[effectArray].includes(effectType)
              ? "removed"
              : "added";
            setCombatLog((prev) => [
              `${unit.name} ${action} ${effectType}`,
              ...prev,
            ]);
            return {
              ...unit,
              [effectArray]: updatedEffects,
              currentSpeed: newSpeed,
            };
          }
          return unit;
        })
      );
    },
    [applyBuffsAndDebuffs]
  );

  const toggleBuff = useCallback(
    (unitId, buffType) => toggleEffect(unitId, buffType, false),
    [toggleEffect]
  );

  const toggleDebuff = useCallback(
    (unitId, debuffType) => toggleEffect(unitId, debuffType, true),
    [toggleEffect]
  );

  const adjustCR = useCallback((unitId, amount) => {
    if (isNaN(amount)) return;
    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id === unitId) {
          const newCR = Math.max(0, Math.min(100, amount));
          setCombatLog((prev) => [
            `${unit.name}'s CR set to ${newCR}%`,
            ...prev,
          ]);
          return { ...unit, currentCR: newCR };
        }
        return unit;
      })
    );
  }, []);

  const adjustHP = useCallback((unitId, amount) => {
    if (isNaN(amount)) return;
    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id === unitId) {
          const newHP = Math.max(0, Math.min(100, amount));
          setCombatLog((prev) => [
            `${unit.name}'s HP set to ${newHP}%`,
            ...prev,
          ]);
          return { ...unit, currentHP: newHP };
        }
        return unit;
      })
    );
  }, []);

  const setSpeedBonus = useCallback((unitId, percent) => {
    if (isNaN(percent)) return;
    setUnits((prevUnits) =>
      prevUnits.map((unit) => {
        if (unit.id === unitId) {
          const newBuffs = unit.buffs.includes(BUFF_TYPES.SPEED_BONUS)
            ? unit.buffs
            : [...unit.buffs, BUFF_TYPES.SPEED_BONUS];
          setCombatLog((prev) => [
            `${unit.name}'s speed bonus set to ${percent}%`,
            ...prev,
          ]);
          return {
            ...unit,
            speedBonusPercent: percent,
            buffs: newBuffs,
          };
        }
        return unit;
      })
    );
  }, []);

  const advanceTurn = useCallback(() => {
    setUnits((prevUnits) => {
      const updatedUnits = turnOrder
        ? prevUnits.map((unit) =>
            unit.id === turnOrder ? { ...unit, currentCR: 0 } : unit
          )
        : prevUnits;

      const totalSpeed = updatedUnits.reduce(
        (acc, unit) => acc + calculateTotalSpeed(unit),
        0
      );

      const timeTo100 = updatedUnits.map((unit) => {
        if (unit.currentCR >= 100) return 0;
        return (
          (100 - unit.currentCR) / (calculateTotalSpeed(unit) / totalSpeed)
        );
      });

      const minTime = Math.min(...timeTo100);

      const unitsAfterTimeGain = updatedUnits.map((unit) => {
        if (unit.currentCR >= 100) return unit;

        const CRGain = (calculateTotalSpeed(unit) / totalSpeed) * minTime;
        const newCR = Math.min(unit.currentCR + CRGain, 100);
        return { ...unit, currentCR: Math.round(newCR) };
      });

      const readyUnit = unitsAfterTimeGain.find(
        (unit) => unit.currentCR >= 100
      );
      if (readyUnit) {
        setTurnOrder(readyUnit.id);
        setCombatLog((prev) => [`${readyUnit.name}'s turn`, ...prev]);
      }

      return unitsAfterTimeGain;
    });
  }, [turnOrder]);

  const sortedUnits = useMemo(
    () => [...units].sort((a, b) => b.currentCR - a.currentCR),
    [units]
  );

  return {
    units: sortedUnits,
    turnOrder,
    combatLog,
    newUnitName,
    setNewUnitName,
    newUnitSpeed,
    setNewUnitSpeed,
    selectedUnit,
    setSelectedUnit,
    addUnit,
    toggleBuff,
    toggleDebuff,
    adjustCR,
    adjustHP,
    setSpeedBonus,
    advanceTurn,
  };
};

function CombatSystem() {
  const {
    units,
    turnOrder,
    combatLog,
    newUnitName,
    setNewUnitName,
    newUnitSpeed,
    setNewUnitSpeed,
    selectedUnit,
    setSelectedUnit,
    addUnit,
    toggleBuff,
    toggleDebuff,
    adjustCR,
    adjustHP,
    setSpeedBonus,
    advanceTurn,
  } = useCombatSystem();

  const selectedUnitData = units.find((u) => u.id === selectedUnit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            E7 Turn Simulator
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Unit Name"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            />
            <input
              type="number"
              value={newUnitSpeed}
              onChange={(e) => setNewUnitSpeed(e.target.value)}
              placeholder="Base Speed"
              className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            />
            <button
              onClick={addUnit}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 w-full sm:w-auto"
            >
              Add Unit
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {units.map((unit) => (
                <Unit
                  key={unit.id}
                  unit={unit}
                  isActive={unit.id === turnOrder}
                  isSelected={unit.id === selectedUnit}
                  onClick={() => setSelectedUnit(unit.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Unit Controls</h2>
              {selectedUnitData ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    <EffectButton
                      isActive={selectedUnitData.buffs.includes("Speed Buff")}
                      onClick={() =>
                        toggleBuff(selectedUnitData.id, "Speed Buff")
                      }
                      label="Speed Buff"
                      activeColor="bg-blue-600"
                    />
                    <EffectButton
                      isActive={selectedUnitData.buffs.includes("Rage Buff")}
                      onClick={() =>
                        toggleBuff(selectedUnitData.id, "Rage Buff")
                      }
                      label="Rage Buff"
                      activeColor="bg-red-600"
                    />
                    <EffectButton
                      isActive={selectedUnitData.debuffs.includes(
                        "Speed Debuff"
                      )}
                      onClick={() =>
                        toggleDebuff(selectedUnitData.id, "Speed Debuff")
                      }
                      label="Speed Debuff"
                      activeColor="bg-yellow-600"
                    />
                    <EffectButton
                      isActive={selectedUnitData.buffs.includes("Revenge Set")}
                      onClick={() =>
                        toggleBuff(selectedUnitData.id, "Revenge Set")
                      }
                      label="Revenge Set"
                      activeColor="bg-purple-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <NumberInput
                      label="Combat Readiness"
                      placeholder="0-100"
                      onSubmit={(value) => adjustCR(selectedUnitData.id, value)}
                      buttonColor="bg-green-600"
                    />
                    <NumberInput
                      label="Health Percentage"
                      placeholder="0-100"
                      onSubmit={(value) => adjustHP(selectedUnitData.id, value)}
                      buttonColor="bg-purple-600"
                    />
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs text-gray-400">
                        Speed Bonus Percentage
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          className="flex-1 px-3 py-2 rounded-l bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Speed %"
                        />
                        <button
                          onClick={(e) =>
                            setSpeedBonus(
                              selectedUnitData.id,
                              parseInt(e.target.previousSibling.value, 10)
                            )
                          }
                          className="px-4 py-2 bg-orange-600 text-white font-medium rounded-r transition-colors duration-200 hover:opacity-90 whitespace-nowrap"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Select a unit to modify
                </div>
              )}
            </div>

            <button
              onClick={advanceTurn}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-lg font-bold hover:opacity-90 transition-opacity duration-200"
            >
              {turnOrder === null ? "Start Combat" : "Next Turn"}
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-8">
          <CombatLog logs={combatLog} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return <CombatSystem />;
}

export default App;
