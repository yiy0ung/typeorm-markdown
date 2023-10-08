#!/usr/bin/env node

import commander from 'commander';
import ts from 'typescript';
import path from 'path';
import pkg from '../../package.json';
import { TypeormMarkdownApplication } from '../TypeormMarkdownApplication';

type ProgramOptions = {
  project: string;
  input: string;
  output: string;
  title: string;
};

async function main(options: ProgramOptions) {
  const tsconfigPath: string = path.join(process.cwd(), options.project ?? 'tsconfig.json');
  const searchPath: string = path.dirname(tsconfigPath);
  const configName: string = path.basename(tsconfigPath);

  const tsconfigStr: string | undefined = ts.findConfigFile(
    searchPath,
    ts.sys.fileExists,
    configName,
  );

  await TypeormMarkdownApplication.generate({
    title: options.title,
    input: options.input,
    output: options.output,
    compilerOptions: tsconfigStr
      ? ts.readConfigFile(tsconfigStr, ts.sys.readFile).config?.compilerOptions
      : undefined,
  });
}

const DEFAULT_TITLE: string = 'ERD';

console.log(`${pkg.name} version ${pkg.version}`);
const program: commander.Command = new commander.Command();
program
  .version(pkg.version, '-v, --version', 'Print the current version')
  .requiredOption('-i, --input <input_regex>', 'Input entity files as a glob pattern')
  .option('-o, --output <dir_path>', 'Directory path where the erd document will be output', './')
  .option('-t, --title <title>', 'Title of the generated erd document', DEFAULT_TITLE)
  .option(
    '--project <project_path>',
    'Use --project to explicitly specify the path to a tsconfig.json',
    'tsconfig.json',
  );

program.parse(process.argv);

main(program.opts<ProgramOptions>());
