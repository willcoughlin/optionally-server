import { CalculatorInput, StrategyType, OptionInput } from "../graphql/types";
import { GQLSafeNumber } from "./types";
import { validate } from "graphql";

/**
 * Calculates entry cost (or credit) of a given input.
 * @param input Calculator input.
 * @returns Entry cost or credit as a number.
 */
export function calculateEntryCost(input: CalculatorInput) {
  let entryCost = 100;  // Standard 100x contract multiplier
  const getContractCost = (price: number, quantity: number) => price * quantity;

  switch (input.strategy) {
    case StrategyType.Call: {
      const callInput = validateCallPutOptionLeg(input);
      let contractCost = getContractCost(callInput.currentPrice, callInput.quantity);
      if (callInput === input.shortCall)
        contractCost *= -1;  // Credit if short
      entryCost *= contractCost;
      break;
    }
    case StrategyType.Put: {
      const putInput = validateCallPutOptionLeg(input);
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
    case StrategyType.BullCallSpread:
    case StrategyType.BearCallSpread:
    case StrategyType.BearPutSpread:
    case StrategyType.BullPutSpread: {
      const [longLeg, shortLeg] = validateVerticalSpreadOptionLegs(input);
      entryCost *= getContractCost(longLeg.currentPrice, longLeg.quantity) - getContractCost(shortLeg.currentPrice, shortLeg.quantity);
      break;
    }
    case StrategyType.IronCondor: {
      if (!input.longCall || !input.shortCall || !input.longPut || !input.shortPut)
        throw new Error('All of longCall, shortCall, longPut, shortPut must be defined for StrategyType.IronCondor');

      const callSpreadPrice = getContractCost(input.longCall.currentPrice, input.longCall.quantity) 
        - getContractCost(input.shortCall.currentPrice, input.shortCall.quantity);
      const putSpreadPrice = getContractCost(input.longPut.currentPrice, input.longPut.quantity)
        - getContractCost(input.shortPut.currentPrice, input.shortPut.quantity);

      entryCost *= callSpreadPrice + putSpreadPrice;
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
    case StrategyType.StraddleStrangle: {
      const entryCost = calculateEntryCost(input);
      if (entryCost < 0)
        return [null, entryCost];
      return [entryCost, null];
    }
    case StrategyType.BullCallSpread:
    case StrategyType.BearPutSpread: {
      const entryCost = calculateEntryCost(input);
      const strikePriceDifference = input.strategy === StrategyType.BullCallSpread 
        ? (input.shortCall?.strike ?? 0) - (input.longCall?.strike ?? 0)
        : (input.longPut?.strike ?? 0) - (input.shortPut?.strike ?? 0);
      return [entryCost, strikePriceDifference * 100 - entryCost];
    }
    case StrategyType.BearCallSpread:
    case StrategyType.BullPutSpread: {
      const entryCost = calculateEntryCost(input);
      const strikePriceDifference = input.strategy === StrategyType.BearCallSpread 
        ? (input.longCall?.strike ?? 0) - (input.shortCall?.strike ?? 0)
        : (input.shortPut?.strike ?? 0) - (input.longPut?.strike ?? 0);
      return [strikePriceDifference * 100 + entryCost, entryCost];
    }
    case StrategyType.IronCondor: {
      const entryCost = calculateEntryCost(input);
    }
    default:
      throw new Error('Not implemented');
  }
}

/**
 * Validates option leg for Call or Put strategy type.
 * @param input Calculator input with StrategyType Call or Put.
 * @returns Call or Put option to use in calculation.
 */
function validateCallPutOptionLeg(input: CalculatorInput) {
  if (input.strategy === StrategyType.Call) {
    const callInput = input.longCall ?? input.shortCall;
      if (!callInput)
        throw new Error('longCall or shortCall must be defined for StrategyType.Call');
      return callInput;
  }
  if (input.strategy === StrategyType.Put) {
    const putInput = input.longPut ?? input.shortPut;
    if (!putInput)
      throw new Error('longPut or shortPut must be defined for StrategyType.Put');
    return putInput;
  }
  throw new Error('StrategyType must be Call or Put');
}

/**
 * Validates option legs for Vertical Spread strategies.
 * @param input Calculator input with Vertical Spread strategy type.
 * @returns Tuple of [longCall, shortCall] or [longPut, shortPut]
 */
function validateVerticalSpreadOptionLegs(input: CalculatorInput): [OptionInput, OptionInput] {
  if (input.strategy === StrategyType.BullCallSpread || input.strategy === StrategyType.BearCallSpread) {
    const longCall = input.longCall;
    const shortCall = input.shortCall;

    if (!longCall || !shortCall)
      throw new Error('longCall and shortCall must be defined for StrategyType.'
        + (input.strategy === StrategyType.BullCallSpread ? 'BullCallSpread' : 'BearCallSpread'));

    return [longCall, shortCall];
  }
  if (input.strategy === StrategyType.BearPutSpread || input.strategy === StrategyType.BullPutSpread) {
    const longPut = input.longPut;
    const shortPut = input.shortPut;

    if (!longPut || !shortPut)
      throw new Error('longPut and shortPut must be defined for StrategyType.'
        + (input.strategy === StrategyType.BearPutSpread ? 'BearPutSpread' : 'BullPutSpread'));

    return [longPut, shortPut];
  }
  throw new Error('StrategyType must be a vertical spread type (BullCallSpread, BearCallSpread, BearPutSpread, BullPutSpread)');
}