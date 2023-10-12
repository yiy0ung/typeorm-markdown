import fs from 'fs';
import path from 'path';
import { TypeormMarkdownApplication } from '@src/TypeormMarkdownApplication';
import { ITable } from '@src/structures/ITable';
import { normalizeArray } from '@src/utils/method.utils';
import { SectionCollector } from './internal/sectionCollector';
import { ISectionCollection } from '@src/structures/ISectionCollection';

export namespace MarkdownWriter {
  const FILE_NAME: string = 'erd.md';

  export function write(tables: ITable[], config: TypeormMarkdownApplication.IConfig) {
    let markdown: string = '';

    const collection: ISectionCollection = SectionCollector.collect(tables);
    const tableMap = normalizeArray(tables, table => table.name);

    // TITLE
    markdown += `# ${config.title}\n\n`;

    const sectionNames = Object.keys(collection).sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // INDEX LIST
    sectionNames.map(sectionName => {
      markdown += `- [${sectionName}](#${sectionName})\n`;
    });
    markdown += '\n';

    // ERD & DESCRIBES
    sectionNames.map(sectionName => {
      markdown += `## ${sectionName}\n`;
      const section = collection[sectionName];

      const erdMarkdownContent = writeERDiagram(section.erds);

      let descMarkdownContent: string = '';
      const writtenDescSet = new Set<string>();
      section.describes.forEach(table => {
        if (writtenDescSet.has(table.name)) return;
        writtenDescSet.add(table.name);
        descMarkdownContent += writeTableDescription(table, tableMap) + '\n';
      });

      markdown += erdMarkdownContent + `\n` + descMarkdownContent;
    });

    fs.writeFileSync(path.join(config.output, FILE_NAME), markdown);
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
      let columnDesc = `- \`${column.name}\``;
      const descLines: string[] = column.description.split('\n');
      if (descLines.length === 1 && descLines[0].length === 0) {
        descLines.pop();
      }

      // ADD RELATION COMMENT
      const relatedTable = column.foreignKeyTargetTableName
        ? tableMap[column.foreignKeyTargetTableName]
        : undefined;
      if (relatedTable) {
        const primaryColumn = relatedTable.columns.find(column => column.primaryKey);
        if (descLines.length > 0) {
          descLines.push('');
        }
        if (primaryColumn) {
          descLines.push(
            `Belonged ${relatedTable.name}'s [${relatedTable.name}.${primaryColumn.name}](#${relatedTable.name})`,
          );
        } else {
          descLines.push(`Belonged [${relatedTable.name}](#${relatedTable.name})`);
        }
      }

      // ADD COLUMN DESCRIPTION
      if (descLines.length === 1) {
        columnDesc += `: ${descLines[0]}`;
      } else if (descLines.length > 1) {
        descLines.forEach(descLine => {
          columnDesc += `\n  > ${descLine}`;
        });
      }

      markdownContent += columnDesc + '\n';
    });

    return markdownContent;
  }
}
