import moment from 'moment-timezone';
import { OptionType } from '../graphql/types';
import * as optionPricing from './option-pricing';
import { OptionInputWithIV } from './option-pricing';

describe('calculateApproximateRiskFreeInterestRate', function () {
it('adds its inputs', function () {
    expect(optionPricing.calculateApproximateRiskFreeInterestRate(1, 1)).toBe(0.02);
    expect(optionPricing.calculateApproximateRiskFreeInterestRate(0.1, 0.01)).toBe(0.0011);
    expect(optionPricing.calculateApproximateRiskFreeInterestRate(-0.01, 0.01)).toBe(0);
  });
});

describe('calculateOptionPriceForDates', function() {
  describe('with valid option input', function () {    
    it('returns empty array when dates input is empty', function () {
      const option: OptionInputWithIV = {
        underlyingPrice: 40,
        currentPrice: 30,
        expiry: '2025-01-01',
        strike: 34,
        type: OptionType.Call,
        quantity: 1,
        impliedVolatility: 1
      };
      const riskFreeRate = 0.1;

      const result = optionPricing.calculateOptionPriceForDates(option, riskFreeRate, []);
      
      expect(result.length).toBe(0);
    });

    it('returns array of same length as dates input', function () {
      const option: OptionInputWithIV = {
        underlyingPrice: 40,
        currentPrice: 30,
        expiry: '2025-01-01',
        strike: 34,
        type: OptionType.Call,
        quantity: 1,
        impliedVolatility: 1
      };
      const riskFreeRate = 0.1;
      const nowMoment = moment.tz();
      
      const resultFor3Dates = optionPricing.calculateOptionPriceForDates(option, riskFreeRate, Array(3).fill(nowMoment));
      const resultFor10Dates = optionPricing.calculateOptionPriceForDates(option, riskFreeRate, Array(10).fill(nowMoment));
      const resultFor1000Dates = optionPricing.calculateOptionPriceForDates(option, riskFreeRate, Array(1000).fill(nowMoment));
      
      expect(resultFor3Dates.length).toEqual(3);
      expect(resultFor10Dates.length).toEqual(10);
      expect(resultFor1000Dates.length).toEqual(1000);
    });
  });
});