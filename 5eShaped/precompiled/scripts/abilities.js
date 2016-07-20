/* global on:false */

import { updateSkill } from './abilityChecks';
import { updateActions } from './actions';
import { updateAttack } from './attacks';
import { updateSpell } from './spells';
import { getSetItems, getIntValue, getFloatValue, getAbilityMod, addArithmeticOperator, showSign } from './utilities';

const updateAbilityModifier = (ability) => {
  const collectionArray = [ability, `${ability}_bonus`, `${ability}_mod`, `${ability}_mod_with_sign`, `${ability}_check_mod`, `${ability}_check_mod_formula`, `${ability}_check_bonus`, 'global_ability_bonus', 'strength_mod', 'dexterity_mod', 'jack_of_all_trades_toggle', 'jack_of_all_trades', 'remarkable_athlete_toggle', 'remarkable_athlete', 'global_check_bonus'];
  if (ability === 'strength' || ability === 'dexterity') {
    collectionArray.push('finesse_mod');
  }
  if (ability === 'strength') {
    collectionArray.push('weight_multiplier');
    collectionArray.push('carrying_capacity');
    collectionArray.push('max_push_drag_lift');
    collectionArray.push('encumbered');
    collectionArray.push('heavily_encumbered');
  }

  getSetItems('updateAbilityModifier', {
    collectionArray,
    callback: (v, finalSetAttrs) => {
      const abilityScore = getIntValue(v[ability]);
      const abilityBonus = getIntValue(v[`${ability}_bonus`]);
      const globalAbilityBonus = v.global_ability_bonus;
      let abilityScoreCalc = abilityScore + abilityBonus;

      if (!isNaN(globalAbilityBonus)) {
        abilityScoreCalc += getIntValue(globalAbilityBonus);
      }

      const abilityCheckBonus = getIntValue(v[`${ability}_check_bonus`]);
      const abilityMod = getAbilityMod(abilityScoreCalc);

      let abilityCheck = abilityMod;
      let abilityCheckFormula = '';

      if (abilityMod !== 0) {
        abilityCheckFormula = `${abilityMod}[${firstThree(ability)} mod with bonus]`;
      }
      if ((ability === 'strength' || ability === 'dexterity' || ability === 'constitution') && v.remarkable_athlete_toggle === '@{remarkable_athlete}') {
        const remarkableAthlete = getIntValue(v.remarkable_athlete);
        abilityCheck += remarkableAthlete;
        abilityCheckFormula += `${addArithmeticOperator(abilityCheckFormula, remarkableAthlete)}[remarkable athlete]`;
      } else if (v.jack_of_all_trades_toggle === '@{jack_of_all_trades}') {
        const jackOfAllTrades = getIntValue(v.jack_of_all_trades);
        abilityCheck += jackOfAllTrades;
        abilityCheckFormula += `${addArithmeticOperator(abilityCheckFormula, jackOfAllTrades)}[jack of all trades]`;
      }
      if (abilityCheckBonus) {
        abilityCheck += abilityCheckBonus;
        abilityCheckFormula += `${addArithmeticOperator(abilityCheckFormula, abilityCheckBonus)}[${ability} check bonus]`;
      }
      if (v.global_check_bonus) {
        if (!isNaN(v.global_check_bonus)) {
          abilityCheck += getIntValue(v.global_check_bonus);
        }
        if (abilityCheckFormula) {
          abilityCheckFormula += ' + ';
        }
        abilityCheckFormula += '(@{global_check_bonus})[global check bonus]';
      }

      finalSetAttrs[`${ability}_calculated`] = abilityScoreCalc;
      finalSetAttrs[`${ability}_mod`] = abilityMod;
      finalSetAttrs[`${ability}_mod_with_sign`] = showSign(abilityMod);
      finalSetAttrs[`${ability}_check_mod`] = abilityCheck;
      finalSetAttrs[`${ability}_check_mod_with_sign`] = showSign(abilityCheck);
      finalSetAttrs[`${ability}_check_mod_formula`] = abilityCheckFormula;

      if (ability === 'strength') {
        finalSetAttrs.finesse_mod = Math.max(abilityMod, getIntValue(v.dexterity_mod));
        const weightMultiplier = getFloatValue(v.weight_multiplier, 1);
        finalSetAttrs.carrying_capacity = abilityScore * 15 * weightMultiplier;
        finalSetAttrs.max_push_drag_lift = abilityScore * 30 * weightMultiplier;
        finalSetAttrs.encumbered = abilityScore * 5 * weightMultiplier;
        finalSetAttrs.heavily_encumbered = abilityScore * 10 * weightMultiplier;
      } else if (ability === 'dexterity') {
        finalSetAttrs.finesse_mod = Math.max(abilityMod, getIntValue(v.strength_mod));
      }
    },
  });
};
const updateAbilityModifiers = () => {
  updateAbilityModifier('strength');
  updateAbilityModifier('dexterity');
  updateAbilityModifier('constitution');
  updateAbilityModifier('intelligence');
  updateAbilityModifier('wisdom');
  updateAbilityModifier('charisma');
};
const abilitiesSetup = () => {
  on('change:jack_of_all_trades_toggle change:jack_of_all_trades change:global_ability_bonus change:global_check_bonus', () => {
    updateAbilityModifiers();
  });
  on('change:strength change:strength_bonus change:strength_check_mod change:strength_check_bonus change:remarkable_athlete_toggle change:remarkable_athlete change:weight_multiplier', () => {
    updateAbilityModifier('strength');
  });
  on('change:dexterity change:dexterity_bonus change:dexterity_check_mod change:dexterity_check_bonus change:remarkable_athlete_toggle change:remarkable_athlete', () => {
    updateAbilityModifier('dexterity');
  });
  on('change:constitution change:constitution_bonus change:constitution_check_mod change:constitution_check_bonus change:remarkable_athlete_toggle change:remarkable_athlete', () => {
    updateAbilityModifier('constitution');
  });
  on('change:intelligence change:intelligence_bonus change:intelligence_check_mod change:intelligence_check_bonus', () => {
    updateAbilityModifier('intelligence');
  });
  on('change:wisdom change:wisdom_bonus change:wisdom_check_mod change:wisdom_check_bonus', () => {
    updateAbilityModifier('wisdom');
  });
  on('change:charisma change:charisma_bonus change:charisma_check_mod change:charisma_check_bonus', () => {
    updateAbilityModifier('charisma');
  });

  on('change:strength_mod change:dexterity_mod change:constitution_mod change:intelligence_mod change:wisdom_mod change:charisma_mod', () => {
    updateSkill();
    updateAttack();
    updateSpell();
    updateActions();
  });
};


export { abilitiesSetup, updateAbilityModifier, updateAbilityModifiers };