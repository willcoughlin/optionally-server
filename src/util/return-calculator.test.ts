import * as returnCalculator from './return-calculator'
import { CalculatorInput, OptionInput, StrategyType } from '../graphql/types';

describe('calclateEntryCost', function () {
  let testOption: OptionInput;
  
  beforeEach(function() {
    testOption = {
      currentPrice: 0.1,
      expiry: '2020-01-15',
      quantity: 1,
      strike: 50
    };
  });

  describe('with call option strategy', function () {
    it('returns call contract price multiplied by 100', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(10);
    });

    it('returns call cost multipled by quantity', function () {
      testOption.quantity = 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(50);
    });

    it('returns negation if short call option strategy', function() {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        shortCall: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-10);
    });

    it('throws error if no long call or short call defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Call };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });

  describe('with put option strategy', function () {
    it('returns put contract price multiplied by 100', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        longPut: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(10);
    });

    it('returns put cost multipled by quantity', function () {
      testOption.quantity = 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        longPut: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(50);
    });

    it('returns negation if short put option strategy', function() {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        shortPut: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-10);
    });

    it('throws error if no long put or short put defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Put };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });

  describe('with straddle/strangle option strategy', function () {
    it ('adds the total entry cost of the long put and the long call', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption,
        longPut: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it ('returns negation if short straddle/strangle strategy', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        shortCall: testOption,
        shortPut: testOption
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-20);
    });

    it('throws error if no shorts or longs defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.StraddleStrangle };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if only long call defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if long call and short call defined (spread)', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption,
        shortCall: testOption
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if only long put defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longPut: testOption
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if long put and short put defined (spread)', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longPut: testOption,
        shortPut: testOption
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });
});