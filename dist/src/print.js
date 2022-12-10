"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = void 0;
const prettier_1 = __importDefault(require("prettier"));
const { fill, hardline, indent, join, line } = prettier_1.default.doc.builders;
const joinFill = (sep, docs) => {
    return fill(docs.reduce((acc, item) => (acc.length ? [...acc, sep, item] : [item]), []));
};
const printComment = (node, reduceTrailing) => {
    const length = Math.min(2, node.trailing.length) - (reduceTrailing ? 1 : 0);
    const hardlines = Array.from({ length }).map(() => hardline);
    return join('', ['$(', node.text, '$)', ...hardlines]);
};
const printStringOrComment = (node) => {
    if (typeof node === 'string') {
        return node;
    }
    else {
        return printComment(node, false);
    }
};
const printc = (node) => {
    return joinFill(line, ['$c', ...node.children.map(printStringOrComment), '$.']);
};
const printv = (node) => {
    return joinFill(line, ['$v', ...node.children.map(printStringOrComment), '$.']);
};
const printf = (label, node) => {
    return joinFill(line, [label, '$f', ...node.children.map(printStringOrComment), '$.']);
};
const printa = (label, node) => {
    return joinFill(line, [label, '$a', ...node.children.map(printStringOrComment), '$.']);
};
const printe = (label, node) => {
    return joinFill(line, [label, '$e', ...node.children.map(printStringOrComment), '$.']);
};
const printd = (node) => {
    return joinFill(line, ['$d', ...node.children.map(printStringOrComment), '$.']);
};
const printp = (label, node) => {
    return indent(join(hardline, [
        joinFill(line, [label, '$p', ...node.children.map(printStringOrComment), '$=']),
        joinFill(line, [...node.proof.map(printStringOrComment), '$.']),
    ]));
};
const printlabel = (node) => {
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
const printScopeChildren = (node) => {
    return join(hardline, node.children.map(child => {
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
            case '$d':
                return printd(child);
        }
    }));
};
const printscope = (node) => {
    return join(hardline, [indent(join(hardline, ['${', printScopeChildren(node)])), '$}']);
};
const printmm = (node) => {
    return printScopeChildren(node);
};
const removeSoftLineFollowingHardLine = (doc) => {
    let prevHardline = false;
    const docFilter = (child) => child !== undefined;
    const processNode = (doc) => {
        if (Array.isArray(doc)) {
            return doc.map(processNode).filter(docFilter);
        }
        else if (typeof doc === 'string') {
        }
        else if (doc.type === 'concat' || doc.type === 'fill') {
            return Object.assign(Object.assign({}, doc), { parts: doc.parts.map(processNode).filter(docFilter) });
        }
        else if (doc.type === 'indent') {
            const contents = processNode(doc.contents);
            if (contents === undefined) {
                throw new Error('Indent without contents');
            }
            return Object.assign(Object.assign({}, doc), { contents });
        }
        else if (doc.type === 'line') {
            if (doc.hard) {
                prevHardline = true;
                return doc;
            }
            else {
                if (prevHardline) {
                    return undefined;
                }
            }
        }
        else if (doc.type === 'break-parent') {
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
const print = (ast, options) => {
    const node = ast.getValue();
    if (node === null) {
        throw new Error('No node');
    }
    let doc;
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
        case '$d':
            doc = printd(node);
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
    const output = prettier_1.default.doc.printer.printDocToString([doc, hardline], options).formatted;
    return output;
};
exports.print = print;
