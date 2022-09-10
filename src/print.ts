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

const { group, hardline, join, line } = prettier.doc.builders;

const printComment = (node: MMComment): prettier.Doc => {
    return join('', ['$(', node.text, '$)']);
};

const printStringOrComment = (node: string | MMComment): prettier.Doc => {
    if (typeof node === 'string') {
        return node;
    } else {
        return printComment(node);
    }
};

const printc = (node: MMNodeC): prettier.Doc => {
    return group(join(line, ['$c', ...node.children.map(printStringOrComment), '$.']));
};

const printv = (node: MMNodeV): prettier.Doc => {
    return group(join(line, ['$v', ...node.children.map(printStringOrComment), '$.']));
};

const printf = (node: MMNodeF) => {
    return join(line, ['$f', ...node.children.map(printStringOrComment), '$.']);
};

const printa = (node: MMNodeA) => {
    return join(line, ['$a', ...node.children.map(printStringOrComment), '$.']);
};

const printe = (node: MMNodeE) => {
    return join(line, ['$e', ...node.children.map(printStringOrComment), '$.']);
};

const printp = (node: MMNodeP) => {
    return join(line, [
        '$p',
        group(join(line, [...node.children.map(printStringOrComment)])),
        '$=',
        group(join(line, [...node.proof.map(printStringOrComment)])),
        '$.',
    ]);
};

const printlabel = (node: MMNodeLabel) => {
    return group(
        join(line, [
            node.label,
            ...node.children.map(child => {
                if (typeof child === 'string') {
                    throw new Error(`String '${child}' found in label`);
                }

                switch (child.type) {
                    case '$(':
                        return printComment(child);
                    case '$f':
                        return printf(child);
                    case '$a':
                        return printa(child);
                    case '$e':
                        return printe(child);
                    case '$p':
                        return printp(child);
                }
            }),
        ]),
    );
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
            doc = printf(node);
            break;
        case '$a':
            doc = printa(node);
            break;
        case '$e':
            doc = printe(node);
            break;
        case '$p':
            doc = printp(node);
            break;
    }

    const output = prettier.doc.printer.printDocToString(doc, options).formatted;
    return output;
};
