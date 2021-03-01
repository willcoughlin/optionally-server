import { CalculatorInput, OptionInput, OptionType, StrategyType } from '../graphql/types';
import * as returnCalculator from './return-calculator';

let testOption: OptionInput;

beforeEach(function() {
  testOption = {
    currentPrice: 0.1,
    expiry: '2020-01-15',
    quantity: 1,
    strike: 50,
    type: OptionType.Call,
    underlyingPrice: 45,
    underlyingSymbol: ''
  };
});

describe('calculateEntryCost', function () {
  describe('with call option strategy', function () {
    it('returns call contract price multiplied by 100', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(10);
    });

    it('returns call cost multipled by quantity', function () {
      testOption.quantity = 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(50);
    });

    it('returns negation if short call option strategy', function() {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        shortCall: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-10);
    });

    it('throws error if no long call or short call defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Call };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });

  describe('with put option strategy', function () {
    it('returns put contract price multiplied by 100', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        longPut: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(10);
    });

    it('returns put cost multipled by quantity', function () {
      testOption.quantity = 5;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        longPut: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(50);
    });

    it('returns negation if short put option strategy', function() {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        shortPut: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-10);
    });

    it('throws error if no long put or short put defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Put };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it ('returns negation if short straddle/strangle strategy', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        shortCall: testOption,
        shortPut: testOption
      };
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(-20);
    });

    it('throws error if no shorts or longs defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.StraddleStrangle };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if only long call defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if long call and short call defined (spread)', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption,
        shortCall: testOption
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if only long put defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longPut: testOption
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
      expect(tryGetResult).toThrow();
    });

    it('throws error if long put and short put defined (spread)', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.StraddleStrangle,
        longPut: testOption,
        shortPut: testOption
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it('throws error when not all legs defined', function() {
      const longCall = testOption;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.BullCallSpread,
        longCall
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
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
      const entryCost = returnCalculator.calculateEntryCost(calculatorInput);
      expect(entryCost).toEqual(20);
    });

    it('throws error when not all legs defined', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall: testOption,
        shortCall: testOption,
        longPut: testOption
      };
      const tryGetResult = () => returnCalculator.calculateEntryCost(calculatorInput);
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
      expect(maxReturn).toEqual(10);
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
      expect(maxReturn).toEqual(10);  // cost of entry
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
  describe('with iron condor strategy', function () {
    it('returns entry cost as max reward and calculates max risk based on strikes', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      const shortPut = Object.assign({}, testOption);
      const longPut = Object.assign({}, testOption);
      // Call credit spread cost of entry: (0.3 - 0.5) * 100 = -20
      longCall.currentPrice = 0.3;
      shortCall.currentPrice = 0.5;
      // Put credit spread cost of entry: (0.3 - 0.5) * 100 = = -20 
      shortPut.currentPrice = 0.5;
      longPut.currentPrice = 0.3;
      longCall.strike += 7;
      shortCall.strike += 6;
      shortPut.strike -= 6;
      longPut.strike -= 7;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall,
        shortCall,
        shortPut,
        longPut
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(60);
      expect(maxReturn).toEqual(40);
    });
    it('uses max strike difference to determine max risk', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      const shortPut = Object.assign({}, testOption);
      const longPut = Object.assign({}, testOption);
      // Call credit spread cost of entry:-30
      longCall.currentPrice = 0.2;
      shortCall.currentPrice = 0.5;
      // Put credit spread cost of entry: -20
      shortPut.currentPrice = 0.5;
      longPut.currentPrice = 0.3;
      // Call strike diff: 2
      longCall.strike += 8;
      shortCall.strike += 6;
      shortPut.strike -= 6;
      longPut.strike -= 7;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall,
        shortCall,
        shortPut,
        longPut
      };
      const [maxRisk, _] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(150);  // 100*(8 - 6) - 50
    });
    it('swaps max risk and max return when long iron condor', function () {
      const longCall = Object.assign({}, testOption);
      const shortCall = Object.assign({}, testOption);
      const shortPut = Object.assign({}, testOption);
      const longPut = Object.assign({}, testOption);
      // Call debit spread cost of entry: (0.5 - 0.3) * 100 = 20
      shortCall.currentPrice = 0.3;
      longCall.currentPrice = 0.5;
      // Put credit spread cost of entry: (0.5 - 0.3) * 100 = = 20 
      longPut.currentPrice = 0.5;
      shortPut.currentPrice = 0.3;
      shortCall.strike += 7;
      longCall.strike += 6;
      longPut.strike -= 6;
      shortPut.strike -= 7;
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.IronCondor,
        longCall,
        shortCall,
        shortPut,
        longPut
      };
      const [maxRisk, maxReturn] = returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(maxRisk).toEqual(40);
      expect(maxReturn).toEqual(60);
    });
    it ('throws error when one leg not defined', function () {
      const calculatorInput: CalculatorInput = { 
        strategy: StrategyType.IronCondor,
        longCall: testOption,
        shortCall: testOption,
        shortPut: testOption
      };
      const tryGetResult = () => returnCalculator.calculateMaxRiskAndReturn(calculatorInput);
      expect(tryGetResult).toThrow();  
    });
  });
});

describe('calculateBreakevenAtExpiry', function () {
  describe('with long call strategy', function () {
    it('returns strike price plus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        longCall: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(1)
      expect(result).toContain(50.1);
    });
    it('throws error when call leg not defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Call };
      const tryGetResult = () => returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });
  describe('with short call strategy', function () {
    it('returns strike price minus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Call,
        shortCall: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(1)
      expect(result).toContain(49.9);
    });
  });
  describe('with long put strategy', function () {
    it('returns strike price minus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        longPut: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(1);
      expect(result).toContain(49.9);
    });
    it('throws error when put leg not defined', function () {
      const calculatorInput: CalculatorInput = { strategy: StrategyType.Put };
      const tryGetResult = () => returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });
  describe('with short put strategy', function () {
    it('returns strike price plus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.Put,
        shortPut: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(1);
      expect(result).toContain(50.1);
    });
  });
  describe('with long straddle/strangle stategy', function () {
    it('returns call strike plus contract price and put strike minus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption,
        longPut: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(2);
      expect(result).toEqual([50.1, 49.9]);
    });
    it('throws error when put leg not defined', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        longCall: testOption
      };
      const tryGetResult = () => returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(tryGetResult).toThrow();
    });
  });
  describe('with short straddle/strangle stategy', function () {
    it('returns call strike minus contract price and put strike plus contract price', function () {
      const calculatorInput: CalculatorInput = {
        strategy: StrategyType.StraddleStrangle,
        shortCall: testOption,
        shortPut: testOption
      };
      const result = returnCalculator.calculateBreakevenAtExpiry(calculatorInput);
      expect(result).toHaveLength(2);
      expect(result).toEqual([49.9, 50.1]);
    });
  });
});