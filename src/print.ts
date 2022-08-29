import prettier from 'prettier';
import { MMNode, MMNodeMM } from './parseTreeFormat';

const builders = prettier.doc.builders;

const printNode = (node: MMNode): prettier.Doc => {
    const array = (node.children ?? []).map(child => {
        if (typeof child === 'string') {
            return child;
        } else if (child.type === '$(') {
            return child.text;
        } else {
            return printNode(child);
        }
    });

    return builders.join(' ', array);
};

export const print = (ast: prettier.AstPath<MMNodeMM>, options: prettier.ParserOptions): string => {
    const rootNode = ast.getValue();

    if (rootNode === null) {
        throw new Error('No node');
    }

    const doc = printNode(rootNode);
    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
};
