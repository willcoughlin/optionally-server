import { RESTDataSource } from "apollo-datasource-rest";
import IEconApi from "../IEconApi";
import { Moment } from "moment";

export default class QuandlEconApi extends RESTDataSource implements IEconApi {
  private apiKey: string | undefined;

  public constructor() {
    super();
    this.baseURL = process.env.QUANDL_BASEURL;
    this.apiKey = process.env.QUANDL_APIKEY;
  }

  public async getNearestTBillRate(target: Moment): Promise<number> {
    return 0;
  }

  public async getInflationRate(): Promise<number> {
    return 0;
  }
}