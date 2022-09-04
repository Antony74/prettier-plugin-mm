import prettier from 'prettier';
import { MMComment, MMNodeC, MMNodeLabel, MMNodeMM, MMNodeScope, MMNodeV } from './parseTreeFormat';

const builders = prettier.doc.builders;

const printComment = (node: MMComment): prettier.Doc => {
    return builders.join('', ['$(', node.text, '$)']);
};

const printc = (node: MMNodeC): prettier.Doc => {
    return builders.join(
        builders.softline,
        node.children.map(child => {
            if (typeof child === 'string') {
                return child;
            } else {
                return printComment(child);
            }
        }),
    );
};

const printv = (node: MMNodeV): prettier.Doc => {
    return builders.join(
        builders.softline,
        node.children.map(child => {
            if (typeof child === 'string') {
                return child;
            } else {
                return printComment(child);
            }
        }),
    );
};

const printlabel = (node: MMNodeLabel) => {
    return builders.join(builders.softline, [node.label, 'TO DO - labels']);
};

const printScopeChildren = (node: MMNodeMM | MMNodeScope): prettier.Doc => {
    return builders.join(
        builders.hardline,
        node.children.map(child => {
            if (typeof child === 'string') {
                throw new Error(`String '${child}' found in root document`);
            }

            switch (child.type) {
                case '$(':
                    return printComment(child);
                case '$c':
                    return printc(child);
                case '$v':
                    return printv(child);
                case 'label':
                    return printlabel(child);
                case '${':
                    return printscope(child);
            }
        }),
    );
};

const printscope = (node: MMNodeScope): prettier.Doc => {
    return builders.join(builders.hardline, ['${', printScopeChildren(node), '$}']);
};

const printmm = (node: MMNodeMM): prettier.Doc => {
    return printScopeChildren(node);
};

export const print = (ast: prettier.AstPath<MMNodeMM>, options: prettier.ParserOptions): string => {
    const rootNode = ast.getValue();

    if (rootNode === null) {
        throw new Error('No node');
    }

    const doc = printmm(rootNode);
    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
};
