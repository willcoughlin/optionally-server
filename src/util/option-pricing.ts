let bs = require('black-scholes');
import moment, { Moment } from 'moment-timezone';
import { OptionInput, OptionType } from '../graphql/types';

export type OptionInputWithIV = OptionInput & { impliedVolatility: number };

export function calculateApproximateRiskFreeInterestRate(tBillRate: number, inflationRate: number) {
  return (tBillRate + inflationRate) / 100;
}

export function calculateOptionPriceForDates(option: OptionInputWithIV, riskFreeInterestRate: number, dates: Moment[]) {
  if (dates.length == 0) return [];

  const expiry = moment.tz(option.expiry, 'America/New_York');
  const optionsPrices = dates.map(d => bs.blackScholes(
    option.underlyingPrice,
    option.strike,
    Math.max(expiry.diff(d, 'y', true), 0),  // safe-guard against negative, which will return NaN
    option.impliedVolatility,
    riskFreeInterestRate,
    option.type == OptionType.Call ? 'call' : 'put'
  ));
  return optionsPrices
}

export function calculateApproximateImpliedVolatility(option: OptionInput, riskFreeInterestRate: number, startValue?: number) {
  const t = moment(option.expiry).diff(moment(), 'y', true);
  const calcPrice = (iv: number) => bs.blackScholes(option.underlyingPrice, option.strike, t, iv, riskFreeInterestRate / 100, 
    option.type === OptionType.Call ? 'call' : 'put');
  
    const actualPrice = option.currentPrice;
    const precision = actualPrice < 0.1 ? 0.01 : 0.05;
    let bsPrice = 0;
    let iv = startValue ?? 0.5;
    while (Math.abs(actualPrice - bsPrice) > precision) {
      if (bsPrice > actualPrice) iv -= 0.5 * iv;
      else if (bsPrice < actualPrice) iv += 0.5 * iv;
      bsPrice = calcPrice(iv);
    }

    return iv;
}