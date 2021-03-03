import moment, { Moment } from 'moment-timezone';
import IEconApi from '../data-source/econ-api/IEconApi';
import { CalculatorInput, OptionInput, ReturnsTable, StrategyType } from "../graphql/types";
import { calculateApproximateImpliedVolatility, calculateApproximateRiskFreeInterestRate, calculateOptionPriceForDates, OptionInputWithIV } from './option-pricing';
import { GQLSafeNumber } from "./types";

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
      let callInput: OptionInput;
      let putInput: OptionInput;
      if (input.longCall && input.longPut) {
        callInput = input.longCall;
        putInput = input.longPut;
      } else if (input.shortCall && input.shortPut) {
        callInput = input.shortCall;
        putInput = input.shortPut;
      } else {
        throw new Error('Both longCall and longPut or shortCall and shortPut must be defined for StrategyType.StraddleStrangle');
      }

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
        return [null, -entryCost];
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
      return [strikePriceDifference * 100 + entryCost, -entryCost];
    }
    case StrategyType.IronCondor: {
      const entryCost = calculateEntryCost(input);
      const callStrikeDifference = Math.abs((input.longCall?.strike ?? 0) - (input.shortCall?.strike ?? 0));
      const putStrikeDifference = Math.abs((input.longPut?.strike ?? 0) - (input.shortPut?.strike ?? 0));
      const maxStrikeDifference =  Math.max(callStrikeDifference, putStrikeDifference);
      if (entryCost < 0) 
        return [maxStrikeDifference * 100 + entryCost, -entryCost];
      return [entryCost, maxStrikeDifference * 100 - entryCost];
    }
    default:
      throw new Error('Not implemented');
  }
}

/**
 * Calculates breakeven point of underlying stock at expiry.
 * @param input Calculator input.
 * @returns Breakeven underlying stock price.
 */
export function calculateBreakevenAtExpiry(input: CalculatorInput) {
  switch (input.strategy) {
    case StrategyType.Call: {
      const callToUse = input.longCall ?? input.shortCall;
      if (callToUse)
        return [callToUse == input.longCall ? callToUse.strike + callToUse.currentPrice : callToUse.strike - callToUse.currentPrice];
      throw new Error('longCall or shortCall must be defined for StrategyType.Call');
    }
    case StrategyType.Put: {
      const putToUse = input.longPut ?? input.shortPut;
      if (putToUse)
        return [putToUse == input.longPut ? putToUse.strike - putToUse.currentPrice : putToUse.strike + putToUse.currentPrice];      
      throw new Error('longPut or shortPut must be defined for StrategyType.Put');
    }
    case StrategyType.StraddleStrangle: {
      const callToUse = input.longCall ?? input.shortCall;
      const putToUse = input.longPut ?? input.shortPut;
      if (callToUse && putToUse) 
        return [
          callToUse == input.longCall ? callToUse.strike + callToUse.currentPrice : callToUse.strike - callToUse.currentPrice, 
          putToUse == input.longPut ? putToUse.strike - putToUse.currentPrice : putToUse.strike + putToUse.currentPrice
        ];
      throw new Error('Both longCall and longPut or both shortCall and shortPut must be defined for StrategyType.StraddleStrangle');
    }
    case StrategyType.BullCallSpread:
    case StrategyType.BearCallSpread: {
      const isBullSpread = input.strategy === StrategyType.BullCallSpread;
      const callToUse = isBullSpread ? input.longCall : input.shortCall;
      if (callToUse) 
        return [callToUse.strike + callToUse.currentPrice];
      throw new Error(`${isBullSpread ? 'longCall' : 'shortCall'} must be defined for StrategyType.`
        + (isBullSpread ? 'BullCallSpread' : 'BearCallSpread'));
    }
    case StrategyType.BearPutSpread:
    case StrategyType.BullPutSpread: {
      const isBullSpread = input.strategy === StrategyType.BullPutSpread;
      const putToUse = isBullSpread ? input.shortPut : input.longPut;
      if (putToUse) 
        return [putToUse.strike - putToUse.currentPrice];
      throw new Error(`${isBullSpread ? 'shortPut' : 'longPut'} must be defined for StrategyType.`
        + (isBullSpread ? 'BullPutSpread' : 'BearPutSpread'));
    }
    case StrategyType.IronCondor: {
      const callToUse = input.shortCall;
      const putToUse = input.shortPut;
      if (callToUse && putToUse)
        return [callToUse.strike + callToUse.currentPrice, putToUse.strike - putToUse.currentPrice];
      throw new Error('shortCall and shortPut must be defiend for StrategyType.IronCondor');
    }
    default:
      throw new Error('Not implemented');
  }
}

/**
 * Produces theorerical profit or loss on option strategy given a date and asset price.
 * @param input Calculator input.
 * @param econApi IEconApi implementation.
 * @returns Matrix of profit or loss by underlying price and date.
 */
export async function calculateReturnMatrix(input: CalculatorInput, econApi: IEconApi): Promise<ReturnsTable> {
  const optionLegs = selectLegsBasedOnStrategy(input);  
  if (optionLegs.length === 0) throw new Error('Cannot calculate returns for zero-leg strategy');
  
  const expiry = optionLegs[0].expiry;
  // Calendar spread and other strategies with differing expiries not supported
  if (!optionLegs.every(leg => leg.expiry === expiry)) throw new Error('Strategies with varying expiries not supported');
  
  const datesToReturn = getDatesForReturnMatrix(expiry);
  const pricesToReturn = getPricesForReturnMatrix(optionLegs[0].underlyingPrice, optionLegs);
  
  const inflationRate = await econApi.getInflationRate();
  const tBillRate = await econApi.getNearestTBillRate(moment(expiry));
  const riskFreeInterestRate = calculateApproximateRiskFreeInterestRate(tBillRate, inflationRate);

  const optionLegsWithIV: OptionInputWithIV[] = optionLegs.map(leg => ({
    ...leg,
    impliedVolatility: calculateApproximateImpliedVolatility(leg, riskFreeInterestRate)
  }));

  const matrix = Array<Array<number>>();
  for (let price of pricesToReturn) {
    const optionPricesToAdd = new Array<Array<number>>();
    for (let optionLegWithIv of optionLegsWithIV) {
      optionPricesToAdd.push(
        calculateOptionPriceForDates({ ...optionLegWithIv, underlyingPrice: price }, riskFreeInterestRate, datesToReturn)
          .map(price => price * optionLegWithIv.quantity * 100));
    }
    
    const matrixRowForPrice = optionPricesToAdd[0].map((_, i) => optionPricesToAdd.map(row => row[i]).reduce((sum, num) => sum + num));
    matrix.push(matrixRowForPrice);
  }

  return {
    dates: datesToReturn.map(d => d.format('YYYY-MM-DD')),
    underlyingPrices: pricesToReturn,
    dataMatrix: matrix
  };
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

/**
 * Gets legs to use from inpuy based on option strategy.
 * @param input Calculator input.
 * @returns Array of OptionInputs to use.
 */
function selectLegsBasedOnStrategy(input: CalculatorInput) {
  const optionLegs: OptionInput[] = [];
  switch (input.strategy) {
    case StrategyType.Call:
    case StrategyType.Put:
    case StrategyType.StraddleStrangle: {
      if (StrategyType.StraddleStrangle || StrategyType.Call) {
        const callToUse = input.longCall || input.shortCall;
        if (callToUse) optionLegs.push(callToUse);
      }
      if (StrategyType.StraddleStrangle || StrategyType.Put) {
        const putToUse = input.longPut || input.shortPut;
        if (putToUse) optionLegs.push(putToUse);
      }
    }
    case StrategyType.BullCallSpread:
    case StrategyType.BearCallSpread:
    case StrategyType.BearPutSpread:
    case StrategyType.BullPutSpread: {
      if ((StrategyType.IronCondor || StrategyType.BullCallSpread || StrategyType.BearCallSpread)
        && input.longCall && input.shortCall) {
          optionLegs.push(input.longCall, input.shortCall);
      }
      if ((StrategyType.IronCondor || StrategyType.BearPutSpread || StrategyType.BullPutSpread)
        && input.longPut && input.shortPut) {
          optionLegs.push(input.longPut, input.shortPut);
      }
    }
  }
  return optionLegs;
}

/**
 * Creates an array of dates to use in the Return Matrix, up to 90 dates long.
 * @param expiry Expiration date as a string.
 * @returns Array of dates (as Moments, ascending) to use in matrix.
 */
function getDatesForReturnMatrix(expiry: string) {
  const tz = 'America/New_York';
  const expiryMoment = moment.tz(expiry, tz);
  const daysToExpiry = Math.ceil(expiryMoment.diff(moment.tz(tz), 'd', true));
  // Determine step count
  let interval = 1;
  while (daysToExpiry / interval >= 90) {
    interval++;
  }
  // Fill array
  const datesToReturn = new Array<Moment>();
  for (let i = 0; i < daysToExpiry; i += interval) {
    datesToReturn.push(moment.tz(tz).add(i, 'd'));
  }

  return datesToReturn;
}

/**
 * Creates an array of underlying asset prices to use in Return Matrix
 * @param underlyingPrice Underlying asset price.
 * @param optionLegs Legs of option strategy.
 * @returns Array of possible asset prices (descending).
 */
function getPricesForReturnMatrix(underlyingPrice: number, optionLegs: OptionInput[]) {
  const daysToExpiry = moment.tz(optionLegs[0].expiry, 'America/New_York').diff(moment.tz('America/New_York'), 'd');  
  const dPct = 0.05 * Math.log10(1 + daysToExpiry);
  const minValueOfInterest = Math.min(underlyingPrice, optionLegs[0].strike);
  const maxValueOfInterest = Math.max(underlyingPrice, optionLegs[0].strike);
  const maxPriceToReturn = Math.ceil(maxValueOfInterest + (dPct * underlyingPrice));
  const minPriceToReturn = Math.max(0, Math.floor(minValueOfInterest - (dPct * underlyingPrice)));
  const range = maxPriceToReturn - minPriceToReturn;
  
  let interval = 0.05;
  while (range / interval > 30) {
    interval += 0.05;
  }

  const result = [];
  for (let i = maxPriceToReturn; i >= minPriceToReturn; i -= interval) {
    result.push(i);
  }

  return result;
}