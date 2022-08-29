import prettier from 'prettier';
import { AstNode } from './parseTreeFormat';

const builders = prettier.doc.builders;

const printNode = (ast: any): prettier.Doc => {
    return builders.join(' ', ast);
}

export const print = (ast: prettier.AstPath<AstNode>, options: prettier.ParserOptions): string => {
    const rootNode = ast.getValue();

    if (rootNode === null) {
        throw new Error('No node');
    }

    const doc = printNode(rootNode);
    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
}
