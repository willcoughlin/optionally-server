import { CalculatorInput, StrategyType } from "../graphql/types";
import { GQLSafeNumber } from "./types";

/**
 * Calculates entry cost (or credit) of a given input.
 * @param input Calculator input.
 * @returns Entry cost or credit as a number.
 */
export function calclateEntryCost(input: CalculatorInput) {
  let entryCost = 100;  // Standard 100x contract multiplier
  const getContractCost = (price: number, quantity: number) => price * quantity;

  switch (input.strategy) {
    case StrategyType.Call: {
      // Determine whether to use long or short
      const callInput = input.longCall ?? input.shortCall;
      if (!callInput)
        throw new Error('longCall or shortCall must be defined for StrategyType.Call');

      let contractCost = getContractCost(callInput.currentPrice, callInput.quantity);
      if (callInput === input.shortCall)
        contractCost *= -1;  // Credit if short
      entryCost *= contractCost;
      break;
    }
    case StrategyType.Put: {
      const putInput = input.longPut ?? input.shortPut;
      if (!putInput)
        throw new Error('longPut or shortPut must be defined for StrategyType.Put');

      let contractCost = getContractCost(putInput.currentPrice, putInput.quantity);
      if (putInput === input.shortPut)
        contractCost *= -1;
      entryCost *= contractCost;
      break;
    }
    case StrategyType.StraddleStrangle: {
      // Determine whether to use long or short call and put
      const callInput = input.longCall ?? input.shortCall;
      const putInput = input.longPut ?? input.shortPut;
      if (!callInput || !putInput)
        throw new Error('Both longCall and longPut or shortCall and shortPut must be defined for StrategyType.StraddleStrangle');

      let callContractCost = getContractCost(callInput.currentPrice, callInput.quantity);
      let putContactCost = getContractCost(putInput.currentPrice, putInput.quantity); 
      // Credit if short
      if (callInput === input.shortCall)
        callContractCost *= -1;
      if (putInput === input.shortPut)
        putContactCost *= -1;

      if (callContractCost * putContactCost < 0)
        throw new Error('Call and put must both be long or short for StrategyType.StraddleStrangle');

      entryCost *= callContractCost + putContactCost;
      break;
    }

    default:
      throw new Error('Not implemented');
  }
  return entryCost;
}

/**
 * Calculates maximum risk and maximum return
 * @param input Calculator input.
 * @returns A tuple of [maxRisk, maxReward].
 */
export function calculateMaxRiskAndReturn(input: CalculatorInput): [GQLSafeNumber, GQLSafeNumber] {
  switch (input.strategy) {
    case StrategyType.Call:
    case StrategyType.Put:
    case StrategyType.StraddleStrangle:
      const entryCost = calclateEntryCost(input);
      if (entryCost < 0)
        return [null, entryCost];
      return [entryCost, null];
    
    default:
      throw new Error('Not implemented');
  }
}