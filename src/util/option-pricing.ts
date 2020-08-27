import { blackScholes } from 'black-scholes';
import moment, { Moment } from "moment";
import { Option, OptionType } from '../graphql/types';

export function calculateApproximateRiskFreeInterestRate(tBillRate: number, inflationRate: number) {
  return tBillRate + inflationRate;
}

export function calculateOptionPriceForDates(option: Option, volatility: number, riskFreeInterestRate: number, dates: Moment[]) {
  const expiry = moment(option.expiry);
  // TODO: get volatility from params
  const v = 0.2;
  const optionsPrices = dates.map(d => blackScholes(
    option.last,
    option.strike,
    expiry.diff(d, 'y'),
    v,
    riskFreeInterestRate,
    option.type == OptionType.Call ? 'call' : 'put'
  ));
  return optionsPrices
}