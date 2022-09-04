import checkmm from 'checkmm';
import { MonitoredTokenArray } from './MonitoredTokenArray';
import { MMNode, MMNodeC, MMNodeMM } from './parseTreeFormat';

export const parse = (text: string): MMNodeMM => {
    const comments: string[] = [];
    const stack: MMNode[] = [{ type: 'root', children: [] }];

    const { readcomment, parsec } = checkmm;

    checkmm.readcomment = () => {
        const comment = readcomment();
        comments.push(comment);
        checkmm.tokens.push('$(');
        return comment;
    };

    checkmm.parsec = () => {
        const c: MMNodeC = {type: '$c', children: []};
        stack.push(c)
        parsec();
        stack.pop();
        stack[stack.length - 1].children.push(c as any);
    }

    checkmm.tokens = new MonitoredTokenArray({
        onToken: token => token !== '$(',
        onPop: token => stack[stack.length - 1].children.push(token),
    });

    checkmm.data = text;

    while (checkmm.readtokenstofileinclusion()) {}
    checkmm.processtokens();

    return stack[0] as MMNodeMM;
};
