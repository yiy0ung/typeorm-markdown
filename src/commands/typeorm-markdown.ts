#!/usr/bin/env node

import commander from 'commander';
import ts from 'typescript';
import path from 'path';
import pkg from '../../package.json';
import { TypeormMarkdownApplication } from '../TypeormMarkdownApplication';

const DEFAULT_TITLE: string = 'ERD';

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

const program: commander.Command = new commander.Command();

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .requiredOption('-i, --input <input_regex>', '')
  .requiredOption('-o, --output <dir_path>', '')
  .option('-t, --title <title>', 'title for a generated erd', DEFAULT_TITLE)
  .option(
    '--project <project_path>',
    'Use --project to explicitly specify the path to a tsconfig.json',
    'tsconfig.json',
  );

program.parse(process.argv);

main(program.opts<ProgramOptions>());
