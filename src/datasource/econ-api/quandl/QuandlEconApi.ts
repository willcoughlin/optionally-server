import { RESTDataSource } from "apollo-datasource-rest";
import IEconApi from "../IEconApi";
import moment, { Moment } from "moment";
import { QuandlErrorResponse, QuandlDatasetResponse, QuandlTBillData } from "./types";

export default class QuandlEconApi extends RESTDataSource implements IEconApi {
  private apiKey: string | undefined;

  public constructor() {
    super();
    this.baseURL = process.env.QUANDL_BASEURL;
    this.apiKey = process.env.QUANDL_APIKEY;
  }

  public async getNearestTBillRate(target: Moment) {
    // Quandl API provides rates for these maturities in order
    const maturitiesInWeeks = [4, 13, 26, 52];
    // Find nearest maturity
    const deltas = maturitiesInWeeks.map(weeks => Math.abs(moment().add(weeks, 'w').diff(target)));
    // Quandl API returns rate + coupon equiv for each maturity. Add 1 because the first element is the current date.
    const nearestMaturityIdx = deltas.indexOf(Math.min(...deltas)) * 2 + 1;

    return this.get<QuandlErrorResponse | QuandlDatasetResponse>(`USTREASURY/BILLRATES.json?api_key=${this.apiKey}`)
      .then(res => {
        // If 'quandl_error' prop in response, we got an error
        if ('quandl_error' in res) {
          return undefined;
        }
        // Try cast
        const datasetResponse = res as QuandlDatasetResponse;
        if (datasetResponse == null) {
          return undefined;
        }

        // Get rate
        return (datasetResponse.dataset.data as QuandlTBillData)[0][nearestMaturityIdx] as number;
      })
  }

  public async getInflationRate(): Promise<number> {
    return 0;
  }
}