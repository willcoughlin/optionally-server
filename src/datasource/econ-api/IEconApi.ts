import { Moment } from 'moment';

/**
 * Provides access to US macroeconomic data for options pricing purposes.
 */
export default interface IEconApi {
  getNearestTBillRate(target: Moment): Promise<number | undefined>;
  getInflationRate(): Promise<number | undefined>;
}