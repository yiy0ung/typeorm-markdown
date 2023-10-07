import ts from 'typescript';
import { IErdCollection } from '@src/structures/IErdCollection';
import { ITable } from '@src/structures/ITable';
import { parseCommentAndJSDoc, parseCommentLine } from '@src/utils/string.utils';

export namespace EntityAnalyzer {
  const NAMESPACE_TAG: string = 'namespace';
  const ERD_TAG: string = 'erd';
  const DESCRIBE_TAG: string = 'describe';
  const HIDDEN_TAG: string = 'hidden';

  export function analyze(erdCollection: IErdCollection, program: ts.Program, table: ITable): void {
    const sourceFile = program.getSourceFile(table.file);
    if (!sourceFile) return;

    // EXPLORE ENTITY
    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        const name = node.name?.escapedText;
        if (name !== table.entityName) return;

        analyzeEntity(erdCollection, sourceFile, node, table);
      }
    });
  }

  function analyzeEntity(
    erdCollection: IErdCollection,
    sourceFile: ts.SourceFile,
    classNode: ts.ClassDeclaration,
    table: ITable,
  ) {
    // PARSE COMMENTS AND JSDOC
    const sourceFileText = sourceFile.getFullText();
    const commentRanges = ts.getLeadingCommentRanges(sourceFileText, classNode.pos);
    if (commentRanges) {
      commentRanges.forEach(commentRange => {
        const commentAndJSDoc = parseCommentAndJSDoc(
          sourceFileText.substring(commentRange.pos, commentRange.end),
        );
        if (!commentAndJSDoc) return;

        table.description += commentAndJSDoc.comment;

        commentAndJSDoc.jsdoc.forEach(jsdoc => {
          if (!erdCollection[jsdoc.name]) {
            erdCollection[jsdoc.name] = {
              erds: [],
              describes: [],
            };
          }

          const collection = erdCollection[jsdoc.name];
          if (jsdoc.tag === NAMESPACE_TAG) {
            collection.erds.push(table);
            collection.describes.push(table);
          } else if (jsdoc.tag === ERD_TAG) {
            collection.erds.push(table);
          } else if (jsdoc.tag === DESCRIBE_TAG) {
            collection.describes.push(table);
          } else if (jsdoc.tag === HIDDEN_TAG) {
            table.hidden = true;
          }
        });
      });
    }

    // EXPLORE PROPERTIES
    classNode.members.forEach(member => {
      if (ts.isPropertyDeclaration(member)) {
        analyzeProperty(sourceFileText, member, table);
      }
    });
  }

  function analyzeProperty(
    sourceFileText: string,
    propertyNode: ts.PropertyDeclaration,
    table: ITable,
  ) {
    const propertyName = propertyNode.name.getText();
    const column = table.columns.find(column => column.name === propertyName);
    if (!column) return;

    // PARSE COMMENTS
    const commentRanges = ts.getLeadingCommentRanges(sourceFileText, propertyNode.pos);
    if (commentRanges) {
      commentRanges.forEach(commentRange => {
        const commentLines = parseCommentLine(
          sourceFileText.substring(commentRange.pos, commentRange.end),
        );
        if (!commentLines) return;

        column.description += commentLines.join('\n');
      });
    }
  }
}
