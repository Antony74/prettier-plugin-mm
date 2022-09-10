import prettier from 'prettier';
import {
    MMComment,
    MMNode,
    MMNodeA,
    MMNodeC,
    MMNodeE,
    MMNodeF,
    MMNodeLabel,
    MMNodeMM,
    MMNodeP,
    MMNodeScope,
    MMNodeV,
} from './parseTreeFormat';

const { fill, group, hardline, indent, join, line } = prettier.doc.builders;

const joinFill = (sep: prettier.Doc, docs: prettier.Doc[]): prettier.Doc => {
    return fill(docs.reduce((acc: prettier.Doc[], item) => (acc.length ? [...acc, sep, item] : [item]), []));
};

const printComment = (node: MMComment, reduceTrailing: boolean): prettier.Doc => {
    const trailing = reduceTrailing ? node.trailing.slice(1, 2) : node.trailing.slice(0, 2);
    const arr = ['$(', node.text, '$)', trailing];
    return arr.join('');
};

const printStringOrComment =
    (reduceTrailing: boolean) =>
    (node: string | MMComment): prettier.Doc => {
        if (typeof node === 'string') {
            return node;
        } else {
            return printComment(node, reduceTrailing);
        }
    };

const printc = (node: MMNodeC): prettier.Doc => {
    return joinFill(line, ['$c', ...node.children.map(printStringOrComment(false)), '$.']);
};

const printv = (node: MMNodeV): prettier.Doc => {
    return joinFill(line, ['$v', ...node.children.map(printStringOrComment(false)), '$.']);
};

const printf = (label: string, node: MMNodeF) => {
    return joinFill(line, [label, '$f', ...node.children.map(printStringOrComment(false)), '$.']);
};

const printa = (label: string, node: MMNodeA) => {
    return joinFill(line, [label, '$a', ...node.children.map(printStringOrComment(false)), '$.']);
};

const printe = (label: string, node: MMNodeE) => {
    return joinFill(line, [label, '$e', ...node.children.map(printStringOrComment(false)), '$.']);
};

const printp = (label: string, node: MMNodeP) => {
    return indent(
        group(
            join(line, [
                joinFill(line, [label, '$p', ...node.children.map(printStringOrComment(false)), '$=']),
                joinFill(line, [...node.proof.map(printStringOrComment(false)), '$.']),
            ]),
        ),
    );
};

const printlabel = (node: MMNodeLabel) => {
    return joinFill(line, [
        ...node.children.map(child => {
            if (typeof child === 'string') {
                throw new Error(`String '${child}' found in label`);
            }

            switch (child.type) {
                case '$(':
                    return printComment(child, false);
                case '$f':
                    return printf(node.label, child);
                case '$a':
                    return printa(node.label, child);
                case '$e':
                    return printe(node.label, child);
                case '$p':
                    return printp(node.label, child);
            }
        }),
    ]);
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
                    return printComment(child, true);
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
    return join(hardline, [indent(join(hardline, ['${', printScopeChildren(node)])), '$}']);
};

const printmm = (node: MMNodeMM): prettier.Doc => {
    return printScopeChildren(node);
};

export const print = (ast: prettier.AstPath<MMNode>, options: prettier.ParserOptions): string => {
    const node = ast.getValue();

    if (node === null) {
        throw new Error('No node');
    }

    let doc: prettier.Doc;

    switch (node.type) {
        case 'root':
            doc = printmm(node);
            break;
        case '${':
            doc = printscope(node);
            break;
        case '$c':
            doc = printc(node);
            break;
        case '$v':
            doc = printv(node);
            break;
        case 'label':
            doc = printlabel(node);
            break;
        case '$f':
            throw new Error(`Can't print ${node.type}, print the label`);
        case '$a':
            throw new Error(`Can't print ${node.type}, print the label`);
        case '$e':
            throw new Error(`Can't print ${node.type}, print the label`);
        case '$p':
            throw new Error(`Can't print ${node.type}, print the label`);
    }

    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
};
