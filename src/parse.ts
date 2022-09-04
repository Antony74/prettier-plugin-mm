import checkmm from 'checkmm';
import { MonitoredTokenArray } from './MonitoredTokenArray';
import { MMNode, MMNodeC, MMNodeLabel, MMNodeMM, MMNodeV } from './parseTreeFormat';

export const parse = (text: string): MMNodeMM => {
    const comments: string[] = [];
    const mmNode: MMNode = { type: 'root', children: [] };
    const stack = checkmm.std.createstack<MMNode>([mmNode]);

    const { readcomment, parsec, parsev, parselabel } = checkmm;

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

        if (parent.type !== 'root') {
            throw new Error(`parselabel unexpected parent node type ${parent.type}`)
        }

        const mmlabel: MMNodeLabel = {type: 'label', label, children: []};
        stack.push(mmlabel);
        parselabel(label);
        stack.pop();
        parent.children.push(mmlabel);
    }

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => {
            if (token === '$(') {
                const comment = comments.pop();

                if (typeof comment !== 'string') {
                    throw new Error('Somehow ran out of comments');
                }

                stack.top().children.push({ type: '$(', text: comment });
                return false;
            }

            return true;
        },
        onPop: token => {
            const parent = stack.top();

            switch (token) {
                case '$c':
                case '$v':
                    break;
                default:
                    if (parent.type !== 'root') {
                        parent.children.push(token);
                    }
            }
        },
    });

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}

    comments.reverse();

    checkmm.processtokens();

    console.log(JSON.stringify(mmNode, null, 2));

    return mmNode;
};
