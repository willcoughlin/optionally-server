/*
 * Types for Quand IEconApi implementation.
 */

export interface IQuandlError {
  code?: string;
  message?: string;
}

export interface IQuandlDataset {
  id: number;
  dataset_code: string;
  database_code: string;
  name: string;
  description: string;
  refreshed_at: string;
  newest_available_date: string;
  oldest_available_date: string;
  column_names: string[];
  frequency: 'monthly' | 'daily';
  type: 'Time Series';
  premium: false;
  start_date: string;
  end_date: string;
  database_id: number;
  limit: null;
  transform: null;
  column_index: null;
  collapse: null;
  order: null;
  data: QuandlTBillData | QuandlInflationData;
}

// export type QuandlTBillData = string[][];
export type QuandlTBillData = [string, ...number[]][];
export type QuandlInflationData = [string, number][];

export type QuandlErrorResponse = {
  quandl_error: IQuandlError;
};

export type QuandlDatasetResponse = {
  dataset: IQuandlDataset;
}