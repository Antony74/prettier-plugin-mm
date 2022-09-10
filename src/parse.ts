import checkmm from 'checkmm';
import { MonitoredTokenArray } from './MonitoredTokenArray';
import { MMNode, MMNodeA, MMNodeC, MMNodeF, MMNodeLabel, MMNodeMM, MMNodeV } from './parseTreeFormat';

export const parse = (text: string): MMNodeMM => {
    const comments: string[] = [];
    const mmNode: MMNode = { type: 'root', children: [] };
    const stack = checkmm.std.createstack<MMNode>([mmNode]);

    const { parsea, parsec, parsef, parselabel, parsev, readcomment } = checkmm;

    checkmm.readcomment = () => {
        const comment = readcomment();
        comments.push(comment);
        checkmm.tokens.push('$(');
        return comment;
    };

    checkmm.parsec = () => {
        const parent = stack.top();

        if (parent.type !== 'root') {
            throw new Error(`parsec unexpected parent node type ${parent.type}`);
        }

        const c: MMNodeC = { type: '$c', children: [] };
        stack.push(c);
        parsec();
        stack.pop();
        parent.children.push(c);
    };

    checkmm.parsev = () => {
        const parent = stack.top();

        if (parent.type !== 'root') {
            throw new Error(`parsev unexpected parent node type ${parent.type}`);
        }

        const v: MMNodeV = { type: '$v', children: [] };
        stack.push(v);
        parsev();
        stack.pop();
        parent.children.push(v);
    };

    checkmm.parselabel = (label: string) => {
        const parent = stack.top();

        if (parent.type !== 'root' && parent.type !== '${') {
            throw new Error(`parselabel unexpected parent node type ${parent.type}`);
        }

        const labelToken = parent.children.pop();

        if (labelToken !== label) {
            throw new Error('parselabel: label expected to match token');
        }

        const mmlabel: MMNodeLabel = { type: 'label', label, children: [] };
        stack.push(mmlabel);
        parselabel(label);
        stack.pop();
        parent.children.push(mmlabel);
    };

    checkmm.parsef = (label: string) => {
        const parent = stack.top();

        if (parent.type !== 'label') {
            throw new Error(`parsef unexpected parent node type ${parent.type}`);
        }

        const fToken = parent.children.pop();

        if (fToken !== '$f') {
            throw new Error('parsef: expected $f token');
        }

        const mmf: MMNodeF = { type: '$f', children: [] };
        stack.push(mmf);
        parsef(label);
        stack.pop();
        parent.children.push(mmf);
    };

    checkmm.parsea = (label: string) => {
        const parent = stack.top();

        if (parent.type !== 'label') {
            throw new Error(`parsea unexpected parent node type ${parent.type}`);
        }

        const aToken = parent.children.pop();

        if (aToken !== '$a') {
            throw new Error('parsea: expected $a token');
        }

        const mma: MMNodeA = { type: '$a', children: [] };
        stack.push(mma);
        parsea(label);
        stack.pop();
        parent.children.push(mma);
    };

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => {
            switch (token) {
                case '$(': {
                    const comment = comments.pop();

                    if (typeof comment !== 'string') {
                        throw new Error('Somehow ran out of comments');
                    }

                    stack.top().children.push({ type: '$(', text: comment });
                    return false;
                }
            }

            return true;
        },
        onPop: token => {
            switch (token) {
                case '$c':
                case '$v':
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

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}

    comments.reverse();

    checkmm.processtokens();

    //    console.log(JSON.stringify(mmNode, null, 2));

    return mmNode;
};
