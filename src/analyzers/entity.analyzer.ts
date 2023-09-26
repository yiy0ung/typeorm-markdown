import { ITable } from '@src/structures/ITable';
import ts from 'typescript';

export namespace EntityAnalyzer {
  export function analyze(program: ts.Program, checker: ts.TypeChecker, table: ITable): void {
    const sourceFile = program.getSourceFile(table.file);
    if (!sourceFile) return;
    console.log('sourceFile: ', sourceFile.getFullText());
  }
}
