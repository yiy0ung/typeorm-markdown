# TypeORM Markdown

![typeorm_markdown_thumbnail](https://github.com/yiy0ung/typeorm-markdown/assets/38432821/1a01ce74-a0e4-4583-b5e9-07fdb8c30735)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENCE)
[![npm version](https://img.shields.io/npm/v/typeorm-markdown.svg)](https://www.npmjs.com/package/typeorm-markdown)
[![Downloads](https://img.shields.io/npm/dm/typeorm-markdown.svg)](https://www.npmjs.com/package/typeorm-markdown)

TypeORM markdown documents generator.

- Mermaid ERD diagrams
- Descriptions by JSDoc
- Separations by @namespace comments

## Set up

```
npm i -D typeorm-markdown
```

### Command Line Interface

```
typeorm-markdown version 1.0.0
Usage: typeorm-markdown [options]

Options:
  -v, --version              Print the current version
  -i, --input <input_regex>  Input entity files as a glob pattern
  -o, --output <dir_path>    Directory path where the erd document will be output (default: "./")
  -t, --title <title>        Title of the generated erd document (default: "ERD")
  --project <project_path>   Use --project to explicitly specify the path to a tsconfig.json (default: "tsconfig.json")
  -h, --help                 display help for command               display help for command
```
