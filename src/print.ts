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

const { fill, hardline, indent, join, line } = prettier.doc.builders;

const joinFill = (sep: prettier.Doc, docs: prettier.Doc[]): prettier.Doc => {
    return fill(docs.reduce((acc: prettier.Doc[], item) => (acc.length ? [...acc, sep, item] : [item]), []));
};

const printComment = (node: MMComment, reduceTrailing: boolean): prettier.Doc => {
    const length = Math.min(2, node.trailing.length) - (reduceTrailing ? 1 : 0);
    const hardlines = Array.from({ length }).map(() => hardline);
    return join('', ['$(', node.text, '$)', ...hardlines]);
};

const printStringOrComment = (node: string | MMComment): prettier.Doc => {
    if (typeof node === 'string') {
        return node;
    } else {
        return printComment(node, false);
    }
};

const printc = (node: MMNodeC): prettier.Doc => {
    return joinFill(line, ['$c', ...node.children.map(printStringOrComment), '$.']);
};

const printv = (node: MMNodeV): prettier.Doc => {
    return joinFill(line, ['$v', ...node.children.map(printStringOrComment), '$.']);
};

const printf = (label: string, node: MMNodeF) => {
    return joinFill(line, [label, '$f', ...node.children.map(printStringOrComment), '$.']);
};

const printa = (label: string, node: MMNodeA) => {
    return joinFill(line, [label, '$a', ...node.children.map(printStringOrComment), '$.']);
};

const printe = (label: string, node: MMNodeE) => {
    return joinFill(line, [label, '$e', ...node.children.map(printStringOrComment), '$.']);
};

const printp = (label: string, node: MMNodeP) => {
    return indent(
        join(hardline, [
            joinFill(line, [label, '$p', ...node.children.map(printStringOrComment), '$=']),
            joinFill(line, [...node.proof.map(printStringOrComment), '$.']),
        ]),
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

const removeSoftLineFollowingHardLine = (doc: prettier.Doc): prettier.Doc => {
    let prevHardline = false;

    const docFilter = (child: prettier.Doc | undefined): child is prettier.Doc => child !== undefined;

    const processNode = (doc: prettier.Doc): prettier.Doc | undefined => {
        if (Array.isArray(doc)) {
            return doc.map(processNode).filter(docFilter);
        } else if (typeof doc === 'string') {
        } else if (doc.type === 'concat' || doc.type === 'fill') {
            return { ...doc, parts: doc.parts.map(processNode).filter(docFilter) };
        } else if (doc.type === 'indent') {
            const contents = processNode(doc.contents);

            if (contents === undefined) {
                throw new Error('Indent without contents');
            }

            return { ...doc, contents };
        } else if (doc.type === 'line') {
            if (doc.hard) {
                prevHardline = true;
                return doc;
            } else {
                if (prevHardline) {
                    return undefined;
                }
            }
        } else if (doc.type === 'break-parent') {
            return doc;
        }

        prevHardline = false;
        return doc;
    };

    const newDoc = processNode(doc);

    if (newDoc === undefined) {
        throw new Error('removeSoftLineFollowingHardLine returning undefined');
    }

    return newDoc;
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
        case '$a':
        case '$e':
        case '$p':
            throw new Error(`Can't print ${node.type}, print the label`);
    }

    doc = removeSoftLineFollowingHardLine(doc);

    const output = prettier.doc.printer.printDocToString([doc, hardline], options).formatted;
    return output;
};
