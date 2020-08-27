import { blackScholes } from 'black-scholes';
import moment, { Moment } from "moment";
import { Option, OptionType } from '../graphql/types';

export function calculateApproximateRiskFreeInterestRate(tBillRate: number, inflationRate: number) {
  return tBillRate + inflationRate;
}

export function calculateOptionPriceForDates(option: Option, riskFreeInterestRate: number, dates: Moment[]) {
  if (dates.length == 0) return [];

  const expiry = moment(option.expiry);
  const optionsPrices = dates.map(d => blackScholes(
    option.last,
    option.strike,
    expiry.diff(d, 'y'),
    option.impliedVolatility,
    riskFreeInterestRate,
    option.type == OptionType.Call ? 'call' : 'put'
  ));
  return optionsPrices
}