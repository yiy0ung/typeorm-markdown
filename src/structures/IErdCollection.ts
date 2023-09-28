import { ITable } from './ITable';

export interface IErdCollection {
  [namespace: string]: {
    namespaces: ITable[];
    erds: ITable[];
    descriptions: ITable[];
  };
}
