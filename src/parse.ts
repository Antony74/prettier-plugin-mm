import checkmm from 'checkmm';
import { MonitoredTokenArray } from './MonitoredTokenArray';
import { MMNode, MMNodeC, MMNodeMM } from './parseTreeFormat';

export const parse = (text: string): MMNodeMM => {
    const comments: string[] = [];
    const mmNode: MMNode = { type: 'root', children: [] };
    const stack = checkmm.std.createstack<MMNode>([mmNode]);

    const { readcomment, parsec } = checkmm;

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

        const c: MMNodeC = {type: '$c', children: []};
        stack.push(c)
        parsec();
        stack.pop();
        parent.children.push(c);
    }

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => token !== '$(',
        onPop: token => stack.top().children.push(token),
    });

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return mmNode;
};
