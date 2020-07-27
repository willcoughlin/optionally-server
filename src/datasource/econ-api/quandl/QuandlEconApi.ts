import { RESTDataSource } from "apollo-datasource-rest";
import IEconApi from "../IEconApi";
import { Moment } from "moment";

export default class QuandlEconApi extends RESTDataSource implements IEconApi {
  constructor() {
    super();
    this.baseURL = 'https://www.quandl.com/api/v3/datasets/';
  }

  public async getNearestTBillRate(target: Moment): Promise<number> {
    return 0;
  }

  public async getInflationRate(): Promise<number> {
    return 0;
  }
}