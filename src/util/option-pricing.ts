import { blackScholes } from 'black-scholes';
import moment, { Moment } from 'moment';
import { OptionType } from '../graphql/types';
import { OptionInput } from './../graphql/types';

export function calculateApproximateRiskFreeInterestRate(tBillRate: number, inflationRate: number) {
  return tBillRate + inflationRate;
}

export function calculateOptionPriceForDates(option: OptionInput, riskFreeInterestRate: number, dates: Moment[]) {
  if (dates.length == 0) return [];

  const expiry = moment(option.expiry);
  const optionsPrices = dates.map(d => blackScholes(
    option.underlyingPrice,
    option.strike,
    expiry.diff(d, 'y'),
    option.impliedVolatility,
    riskFreeInterestRate,
    option.type == OptionType.Call ? 'call' : 'put'
  ));
  return optionsPrices
}