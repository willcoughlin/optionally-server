import { CalculatorInput, StrategyType } from "../graphql/types";
import { GQLSafeNumber } from "./types";

/**
 * Calculates entry cost (or credit) of a given input.
 * @param input Calculator input.
 * @returns Entry cost or credit as a number.
 */
export function calclateEntryCost(input: CalculatorInput) {
  switch (input.strategy) {
    case StrategyType.Call:
      if (input.longCall)
        return input.longCall.currentPrice;
      if (input.shortCall)
        return -input.shortCall.currentPrice;
      throw new Error('longCall or shortCall must be defined for StrategyType.Call');
      
    case StrategyType.Put:
      if (input.longPut)
        return input.longPut.currentPrice;
      if (input.shortPut)
        return -input.shortPut.currentPrice;
      throw new Error('longPut or shortPut must be defined for StrategyType.Put');
    
    case StrategyType.StraddleStrangle:
      if (input.longCall && input.longPut)
        return input.longCall.currentPrice + input.longPut.currentPrice;
      if (input.shortCall && input.shortPut)
        return -input.shortCall.currentPrice - input.shortPut.currentPrice;
      throw new Error('Both longCall and longPut or shortCall and shortPut must be defined for StrategyType.StraddleStrangle');

    default:
      throw new Error('Not implemented');
  }
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