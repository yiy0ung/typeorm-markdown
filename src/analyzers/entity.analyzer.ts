import ts from 'typescript';
import { ITable } from '@src/structures/ITable';
import { parseCommentAndJSDoc, parseCommentLine } from '@src/utils/string.utils';

export namespace EntityAnalyzer {
  export function analyze(program: ts.Program, table: ITable): void {
    const sourceFile = program.getSourceFile(table.file);
    if (!sourceFile) return;

    // EXPLORE ENTITY
    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        const name = node.name?.escapedText;
        if (name !== table.entityName) return;

        analyzeEntity(sourceFile, node, table);
      }
    });
  }

  function analyzeEntity(sourceFile: ts.SourceFile, classNode: ts.ClassDeclaration, table: ITable) {
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
        table.jsdocArgs.push(...commentAndJSDoc.jsdoc);
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
