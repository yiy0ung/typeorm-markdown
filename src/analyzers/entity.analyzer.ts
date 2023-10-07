import ts from 'typescript';
import { IErdCollection } from '@src/structures/IErdCollection';
import { ITable } from '@src/structures/ITable';
import { parseCommentAndJSDoc, parseCommentLine } from '@src/utils/string.utils';

export namespace EntityAnalyzer {
  const NAMESPACE_TAG: string = 'namespace';
  const ERD_TAG: string = 'erd';
  const DESCRIPTION_TAG: string = 'description';
  const HIDDEN_TAG: string = 'hidden';

  export function analyze(erdCollection: IErdCollection, program: ts.Program, table: ITable): void {
    const sourceFile = program.getSourceFile(table.file);
    if (!sourceFile) return;

    // Explore entity
    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        const name = node.name?.escapedText;
        if (name !== table.entity.name) return;

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
    // Parse comments and jsdoc
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
              descriptions: [],
            };
          }

          const collection = erdCollection[jsdoc.name];
          if (jsdoc.tag === NAMESPACE_TAG) {
            collection.erds.push(table);
            collection.descriptions.push(table);
          } else if (jsdoc.tag === ERD_TAG) {
            collection.erds.push(table);
          } else if (jsdoc.tag === DESCRIPTION_TAG) {
            collection.descriptions.push(table);
          } else if (jsdoc.tag === HIDDEN_TAG) {
            table.hidden = true;
          }
        });
      });
    }

    // Explore properties
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

    // Parse comments
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
