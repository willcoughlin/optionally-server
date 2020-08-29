import * as returnCalculator from './return-calculator'
import { CalculatorInput, OptionInput, StrategyType } from '../graphql/types';

let testOption: OptionInput;

beforeEach(function() {
  testOption = {
    currentPrice: 0.1,
    expiry: '2020-01-15',
    quantity: 1,
    strike: 50
  };
});

describe('calclateEntryCost', function () {
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

  describe('with vertical spread strategy', function () {
    it('subtracts short contract price from long contact price', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      longCall.currentPrice *= 2;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BullCallSpread,
        longCall,
        shortCall
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(10);
    });

    it('returns credit for credit spread', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      shortCall.currentPrice *= 2;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BearCallSpread,
        longCall,
        shortCall
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-10);
    });

    it('multiplies cost by quantity', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      longCall.currentPrice *= 2;
      longCall.quantity *= 2;
      shortCall.quantity *= 2;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BullCallSpread,
        longCall,
        shortCall
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it('throws error when not all legs defined', function() {
      const longCall = testOption;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BullCallSpread,
        longCall
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });

  describe ('with iron condor strategy', function() {
    it('adds long leg costs and subtracts short leg costs', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      const longPut = Object.assign({}, testOption);
      const shortPut = Object.assign({}, testOption);
      shortCall.currentPrice *= 2;
      shortPut.currentPrice *= 2;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall,
        shortCall,
        longPut, 
        shortPut
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-20);
    });

    it('returns credit for long iron condor', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      const longPut = Object.assign({}, testOption);
      const shortPut = Object.assign({}, testOption);
      longCall.currentPrice *= 2;
      longPut.currentPrice *= 2;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall,
        shortCall,
        longPut, 
        shortPut
      };
      const entryCost = returnCalculator.calclateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it('throws error when not all legs defined', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall: testOption,
        shortCall: testOption,
        longPut: testOption
      };
      const tryGetResult = () => returnCalculator.calclateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });
});

describe('calculateMaxRiskAndReturn', function () {
  describe('with call or put strategy', function () {
    it('returns entry cost as max risk and infinite max reward when long', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(10);
      expect(maxReturn).toBeNull();
    });
    it('returns entry cost as max reward and infinite max risk when short', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        shortCall: testOption
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toBeNull();
      expect(maxReturn).toEqual(-10);
    });
    it('throws error when call or put not defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Call };
      const tryGetResult = () => returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(tryGetResult).toThrow();  
    });
  });
  describe('with debit spread strategy', function () {
    it('returns entry cost as max risk and calculates max reward based on strikes', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      longCall.currentPrice *= 2;
      shortCall.strike += 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BullCallSpread,
        longCall,
        shortCall
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(10);  // cost of entry
      expect(maxReturn).toEqual(490);  // strike diff (500) - cost of entry
    });
    it ('throws error when one leg not defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.BullCallSpread,
        longCall: testOption
      };
      const tryGetResult = () => returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(tryGetResult).toThrow();  
    });
  });
  describe('with credit spread strategy', function () {
    it('returns entry cost as max reward and calculates max risk based on strikes', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      shortCall.currentPrice *= 2;
      longCall.strike += 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BearCallSpread,
        longCall,
        shortCall
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(490);  // strike diff (500) + cost of entry
      expect(maxReturn).toEqual(-10);  // cost of entry
    });
    it ('throws error when one leg not defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.BearCallSpread,
        shortCall: testOption
      };
      const tryGetResult = () => returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(tryGetResult).toThrow();  
    });
  });
});