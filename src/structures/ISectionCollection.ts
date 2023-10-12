import { ITable } from './ITable';

export interface ISectionCollection {
  [namespace: string]: {
    erds: ITable[];
    describes: ITable[];
  };
}
