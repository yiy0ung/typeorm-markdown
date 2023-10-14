import { ISectionCollection } from '@src/structures/ISectionCollection';
import { ITable } from '@src/structures/ITable';

export namespace SectionCollector {
  export const DEFAULT_NAMESPACE = 'Default';

  const NAMESPACE_TAG: string = 'namespace';
  const ERD_TAG: string = 'erd';
  const DESCRIBE_TAG: string = 'describe';
  const HIDDEN_TAG: string = 'hidden';

  const KEYWORD_TAGS: string[] = [NAMESPACE_TAG, ERD_TAG, DESCRIBE_TAG];

  export function collect(tables: ITable[]) {
    const collection: ISectionCollection = {};

    tables.forEach(table => {
      collectTable(collection, table);
    });

    return collection;
  }

  function collectTable(collection: ISectionCollection, table: ITable) {
    // IGNORE TABLE
    if (table.jsdocArgs.some(jsdoc => jsdoc.tag === HIDDEN_TAG)) return;

    // COLLECT DEFAULT NAMESPACE
    if (table.jsdocArgs.every(jsdoc => jsdoc.tag !== NAMESPACE_TAG)) {
      if (!collection[DEFAULT_NAMESPACE]) {
        collection[DEFAULT_NAMESPACE] = {
          erds: [],
          describes: [],
        };
      }
      collection[DEFAULT_NAMESPACE].erds.push(table);
      collection[DEFAULT_NAMESPACE].describes.push(table);
    }

    table.jsdocArgs
      .filter(jsdoc => KEYWORD_TAGS.includes(jsdoc.tag))
      .forEach(jsdoc => {
        if (!collection[jsdoc.name]) {
          collection[jsdoc.name] = {
            erds: [],
            describes: [],
          };
        }

        const chapter = collection[jsdoc.name];
        if (jsdoc.tag === NAMESPACE_TAG) {
          chapter.erds.push(table);
          chapter.describes.push(table);
        } else if (jsdoc.tag === ERD_TAG) {
          chapter.erds.push(table);
        } else if (jsdoc.tag === DESCRIBE_TAG) {
          chapter.describes.push(table);
        }
      });
  }
}
