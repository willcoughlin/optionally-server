let bs = require('black-scholes');
import moment, { Moment } from 'moment-timezone';
import { OptionType } from '../graphql/types';
import { OptionInput } from './../graphql/types';

export function calculateApproximateRiskFreeInterestRate(tBillRate: number, inflationRate: number) {
  return tBillRate + inflationRate;
}

export function calculateOptionPriceForDates(option: OptionInput, riskFreeInterestRate: number, dates: Moment[]) {
  if (dates.length == 0) return [];

  const expiry = moment.tz(option.expiry, 'America/New_York');
  const optionsPrices = dates.map(d => bs.blackScholes(
    option.underlyingPrice,
    option.strike,
    Math.max(expiry.diff(d, 'y', true), 0),  // safe-guard against negative, which will return NaN
    option.impliedVolatility / 100,
    riskFreeInterestRate / 100,
    option.type == OptionType.Call ? 'call' : 'put'
  ));
  return optionsPrices
}

export function getApproximateImpliedVolatility(option: OptionInput, riskFreeInterestRate: number) {
  const t = moment(option.expiry).diff(moment(), 'y', true);
  const calcPrice = (iv: number) => bs.blackScholes(option.underlyingPrice, option.strike, t, iv, riskFreeInterestRate / 100, 
    OptionType.Call ? 'call' : 'put');
  
    const precision = 0.01;
    const increment = 0.001;
    const actualPrice = option.currentPrice;
    let bsPrice = 0;
    let iv = 1;
    while (Math.abs(actualPrice - bsPrice) > precision) {
      bsPrice = calcPrice(iv);
      if (bsPrice > actualPrice) iv -= increment;
      else if (bsPrice < actualPrice) iv += increment;
    }

    return iv;
}