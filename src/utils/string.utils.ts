/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
export function camelCase(str: string, firstCapital: boolean = false): string {
  if (firstCapital) str = ' ' + str;
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}

/**
 * Converts string into snake_case.
 */
export function snakeCase(str: string): string {
  return (
    str
      // ABc -> a_bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_c
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
}

export function findBetweenString(str: string, start: string, end: string): string[] {
  const arrStr = str.split(start);
  arrStr.splice(0, 1);

  return arrStr.map(ele => ele.split(end)[0]);
}

export function parseCommentLine(commentText: string): string[] | undefined {
  return findBetweenString(commentText, '/**', '*/')[0]
    ?.trim()
    .split('\n')
    .map(comment => comment.trim().replace(/^\*/, '').trim());
}

export type CommentAndJsDoc = {
  comment: string;
  jsdoc: { tag: string; name: string }[];
};

export function parseCommentAndJSDoc(commentText: string): CommentAndJsDoc | undefined {
  const commentLines = parseCommentLine(commentText);
  if (!commentLines) return;

  return commentLines.reduce<{ comment: string; jsdoc: { tag: string; name: string }[] }>(
    (result, commentLine) => {
      if (commentLine.startsWith('@')) {
        commentLine = commentLine.slice(1);

        const [tag, ...names] = commentLine.split(' ');
        result.jsdoc.push({
          tag: tag,
          name: names.join(' '),
        });
      } else {
        if (result.comment.length > 0) commentLine = '\n' + commentLine;
        result.comment += commentLine;
      }

      return result;
    },
    { comment: '', jsdoc: [] },
  );
}
