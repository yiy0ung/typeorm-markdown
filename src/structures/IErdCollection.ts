import { ITable } from './ITable';

export interface IErdCollection {
  [namespace: string]: {
    erds: ITable[];
    descriptions: ITable[];
  };
}
