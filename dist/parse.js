"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const checkmm_1 = __importDefault(require("checkmm"));
const MonitoredTokenArray_1 = require("./MonitoredTokenArray");
const parse = (text) => {
    const comments = [];
    const mmNode = { type: 'root', children: [] };
    const stack = checkmm_1.default.std.createstack([mmNode]);
    const { parsea, parsec, parsed, parsee, parsef, parselabel, parsep, parsev, readcomment } = checkmm_1.default;
    checkmm_1.default.readcomment = () => {
        const text = readcomment();
        let trailing = '';
        let position = checkmm_1.default.dataPosition;
        while (position < checkmm_1.default.data.length && (checkmm_1.default.data[position] === '\n' || checkmm_1.default.data[position] === '\r')) {
            if (checkmm_1.default.data[position] === '\n') {
                trailing += '\n';
            }
            else if (checkmm_1.default.data[position] === '\r') {
            }
            else {
                break;
            }
            ++position;
        }
        comments.push({ type: '$(', text, trailing });
        checkmm_1.default.tokens.push('$(');
        return text;
    };
    checkmm_1.default.parsec = () => {
        const parent = stack.top();
        if (parent.type !== 'root') {
            throw new Error(`parsec unexpected parent node type ${parent.type}`);
        }
        const c = { type: '$c', children: [] };
        stack.push(c);
        parsec();
        stack.pop();
        parent.children.push(c);
    };
    checkmm_1.default.parsed = () => {
        const parent = stack.top();
        if (parent.type !== 'root' && parent.type !== '${') {
            throw new Error(`parsed unexpected parent node type ${parent.type}`);
        }
        const d = { type: '$d', children: [] };
        stack.push(d);
        const result = parsed();
        stack.pop();
        parent.children.push(d);
        return result;
    };
    checkmm_1.default.parsev = () => {
        const parent = stack.top();
        if (parent.type !== 'root' && parent.type !== '${') {
            throw new Error(`parsev unexpected parent node type ${parent.type}`);
        }
        const v = { type: '$v', children: [] };
        stack.push(v);
        parsev();
        stack.pop();
        parent.children.push(v);
    };
    checkmm_1.default.parselabel = (label) => {
        const parent = stack.top();
        if (parent.type !== 'root' && parent.type !== '${') {
            throw new Error(`parselabel unexpected parent node type ${parent.type}`);
        }
        const labelToken = parent.children.pop();
        if (labelToken !== label) {
            throw new Error('parselabel: label expected to match token');
        }
        const mmlabel = { type: 'label', label, children: [] };
        stack.push(mmlabel);
        parselabel(label);
        stack.pop();
        parent.children.push(mmlabel);
    };
    checkmm_1.default.parsef = (label) => {
        const parent = stack.top();
        if (parent.type !== 'label') {
            throw new Error(`parsef unexpected parent node type ${parent.type}`);
        }
        const fToken = parent.children.pop();
        if (fToken !== '$f') {
            throw new Error('parsef: expected $f token');
        }
        const mmf = { type: '$f', children: [] };
        stack.push(mmf);
        parsef(label);
        stack.pop();
        parent.children.push(mmf);
    };
    checkmm_1.default.parsea = (label) => {
        const parent = stack.top();
        if (parent.type !== 'label') {
            throw new Error(`parsea unexpected parent node type ${parent.type}`);
        }
        const aToken = parent.children.pop();
        if (aToken !== '$a') {
            throw new Error('parsea: expected $a token');
        }
        const mma = { type: '$a', children: [] };
        stack.push(mma);
        parsea(label);
        stack.pop();
        parent.children.push(mma);
    };
    checkmm_1.default.parsee = (label) => {
        const parent = stack.top();
        if (parent.type !== 'label') {
            throw new Error(`parsee unexpected parent node type ${parent.type}`);
        }
        const eToken = parent.children.pop();
        if (eToken !== '$e') {
            throw new Error('parsee: expected $e token');
        }
        const mme = { type: '$e', children: [] };
        stack.push(mme);
        parsee(label);
        stack.pop();
        parent.children.push(mme);
    };
    checkmm_1.default.parsep = (label) => {
        const parent = stack.top();
        if (parent.type !== 'label') {
            throw new Error(`parsep unexpected parent node type ${parent.type}`);
        }
        const pToken = parent.children.pop();
        if (pToken !== '$p') {
            throw new Error('parsep: expected $e token');
        }
        const mmp = { type: '$p', children: [], proof: [] };
        stack.push(mmp);
        parsep(label);
        stack.pop();
        const index = mmp.children.findIndex(child => child === '$=');
        mmp.proof = mmp.children.slice(index + 1);
        mmp.children = mmp.children.slice(0, index);
        parent.children.push(mmp);
    };
    checkmm_1.default.tokens = new MonitoredTokenArray_1.MonitoredTokenArray({
        onToken: token => {
            switch (token) {
                case '$(': {
                    const comment = comments.pop();
                    if (!comment) {
                        throw new Error('Somehow ran out of comments');
                    }
                    stack.top().children.push(comment);
                    return false;
                }
            }
            return true;
        },
        onPop: token => {
            switch (token) {
                case '$c':
                case '$v':
                case '$d':
                case '$.':
                    break;
                case '${': {
                    const parent = stack.top();
                    if (parent.type !== 'root' && parent.type !== '${') {
                        throw new Error('Unexpected scope');
                    }
                    stack.push({ type: '${', children: [] });
                    break;
                }
                case '$}': {
                    const scope = stack.pop();
                    const parent = stack.top();
                    if (parent.type !== 'root' && parent.type !== '${') {
                        throw new Error('Unexpected scope');
                    }
                    if (!scope || scope.type !== '${') {
                        throw new Error('Expected scope');
                    }
                    parent.children.push(scope);
                    break;
                }
                default: {
                    const parent = stack.top();
                    parent.children.push(token);
                }
            }
        },
    });
    checkmm_1.default.data = text;
    while (checkmm_1.default.readtokenstofileinclusion()) { }
    comments.reverse();
    checkmm_1.default.processtokens();
    return mmNode;
};
exports.parse = parse;
