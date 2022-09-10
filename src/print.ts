import prettier from 'prettier';
import { MMComment, MMNode, MMNodeC, MMNodeLabel, MMNodeMM, MMNodeScope, MMNodeV } from './parseTreeFormat';

const { group, hardline, join, line } = prettier.doc.builders;

const printComment = (node: MMComment): prettier.Doc => {
    return join('', ['$(', node.text, '$)']);
};

const printc = (node: MMNodeC): prettier.Doc => {
    return group(
        join(
            line,
            node.children.map(child => {
                if (typeof child === 'string') {
                    return child;
                } else {
                    return printComment(child);
                }
            }),
        ),
    );
};

const printv = (node: MMNodeV): prettier.Doc => {
    return join(
        line,
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
    return join(line, [node.label, 'TO DO - labels']);
};

const printScopeChildren = (node: MMNodeMM | MMNodeScope): prettier.Doc => {
    return join(
        hardline,
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
    return join(hardline, ['${', printScopeChildren(node), '$}']);
};

const printmm = (node: MMNodeMM): prettier.Doc => {
    return printScopeChildren(node);
};

export const print = (ast: prettier.AstPath<MMNode>, options: prettier.ParserOptions): string => {
    const rootNode = ast.getValue();

    if (rootNode === null) {
        throw new Error('No node');
    }

    let doc: prettier.Doc;

    switch (rootNode.type) {
        case 'root':
            doc = printmm(rootNode);
            break;
        case '${':
            doc = printscope(rootNode);
            break;
        case '$c':
            doc = printc(rootNode);
            break;
        case '$v':
            doc = printv(rootNode);
            break;
        case 'label':
            doc = printlabel(rootNode);
            break;
    }

    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
};
