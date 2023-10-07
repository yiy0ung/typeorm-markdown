import fs from 'fs';
import path from 'path';
import { TypeormMarkdownApplication } from '@src/TypeormMarkdownApplication';
import { IErdCollection } from '@src/structures/IErdCollection';
import { ITable } from '@src/structures/ITable';
import { normalizeArray } from '@src/utils/method.utils';

export namespace ErdMarkdownWriter {
  const FILE_NAME: string = 'erd.md';

  export function write(
    erdCollection: IErdCollection,
    tables: ITable[],
    config: TypeormMarkdownApplication.IConfig,
  ) {
    let erdMarkdown: string = '';
    const tableMap = normalizeArray(tables, table => table.name);

    // TITLE
    erdMarkdown += `# ${config.title}\n\n`;

    const groupNames = Object.keys(erdCollection).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // INDEX LIST
    groupNames.map(groupName => {
      erdMarkdown += `- [${groupName}](#${groupName})\n`;
    });
    erdMarkdown += '\n';

    // ERD & DESCRIBES
    groupNames.map(groupName => {
      erdMarkdown += `## ${groupName}\n`;
      const collection = erdCollection[groupName];

      const erdMarkdownContent = writeERDiagram(collection.erds);

      let descMarkdownContent: string = '';
      const writtenDescSet = new Set<string>();
      collection.describes.forEach(table => {
        if (writtenDescSet.has(table.name)) return;
        writtenDescSet.add(table.name);
        descMarkdownContent += writeTableDescription(table, tableMap) + '\n';
      });

      erdMarkdown += erdMarkdownContent + `\n` + descMarkdownContent;
    });

    fs.writeFileSync(path.join(config.output, FILE_NAME), erdMarkdown);
  }

  function writeERDiagram(tables: ITable[]): string {
    let schemaContent: string = '';
    let relationContent: string = '';
    const writtenErdSet = new Set<string>();

    tables.forEach(table => {
      if (writtenErdSet.has(table.name)) return;
      writtenErdSet.add(table.name);
      schemaContent +=
        `${table.name} {\n` +
        table.columns
          .map(
            column =>
              `  ${column.type} ${column.name} ${
                column.primaryKey ? 'PK' : column.foreignKey ? 'FK' : ''
              } ${column.nullable ? '"nullable"' : ''}`,
          )
          .join('\n') +
        `\n}\n`;
    });

    tables.forEach(table => {
      table.relations.map(relation => {
        if (!writtenErdSet.has(relation.relationTableName)) return;
        const description = relation.description.length > 0 ? relation.description : 'relations';
        switch (relation.relationType) {
          case 'one-to-one': {
            relationContent += `${table.name} |o--|| ${relation.relationTableName} : ${description}\n`;
            break;
          }
          case 'many-to-one': {
            relationContent += `${table.name} }|--|| ${relation.relationTableName} : ${description}\n`;
            break;
          }
        }
      });
    });

    return `\`\`\`mermaid\nerDiagram\n` + schemaContent + relationContent + `\`\`\``;
  }

  function writeTableDescription(
    table: ITable,
    tableMap: { [tableName: string]: ITable | undefined },
  ): string {
    let markdownContent: string = '';

    markdownContent += `### ${table.name}\n`;
    markdownContent += `${table.description}\n`;
    markdownContent += `**Columns**\n`;
    table.columns.forEach(column => {
      let columnStr = `- \`${column.name}\``;

      const descLines = column.description.split('\n');
      const relatedTable = column.foreignKeyTargetTableName
        ? tableMap[column.foreignKeyTargetTableName]
        : undefined;
      if (relatedTable) {
        const primaryColumn = relatedTable.columns.find(column => column.primaryKey);
        if (primaryColumn) {
          descLines.push(
            `Belonged ${relatedTable.name}'s [${primaryColumn.name}](#${relatedTable.name})`,
          );
        } else {
          descLines.push(`Belonged [${relatedTable.name}](#${relatedTable.name})`);
        }
      }
      if (descLines.length === 1 && descLines[0].length > 0) {
        columnStr += `: ${descLines[0]}`;
      } else if (descLines.length > 1) {
        descLines.forEach(descLine => {
          columnStr += `\n  > ${descLine}`;
        });
      }

      markdownContent += columnStr + '\n';
    });

    return markdownContent;
  }
}
