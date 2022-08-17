import prettier from 'prettier';

const builders = prettier.doc.builders;

export const print = (ast: any, _options: prettier.ParserOptions): prettier.Doc => {
    return builders.join(' ', ast);
}
