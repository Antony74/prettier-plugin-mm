export interface MMComment {
    type: '$(';
    text: string;
    trailing: string;
}

export interface MMNodeC {
    type: '$c';
    children: (string | MMComment)[];
}

export interface MMNodeV {
    type: '$v';
    children: (string | MMComment)[];
}

export interface MMNodeF {
    type: '$f';
    children: (string | MMComment)[];
}

export interface MMNodeA {
    type: '$a';
    children: (string | MMComment)[];
}

export interface MMNodeE {
    type: '$e';
    children: (string | MMComment)[];
}

export interface MMNodeP {
    type: '$p';
    children: (string | MMComment)[];
    proof: (string | MMComment)[];
}

export interface MMNodeLabel {
    type: 'label';
    label: string;
    children: (string | MMNodeF | MMNodeA | MMNodeE | MMNodeP | MMComment)[];
}

export interface MMNodeScope {
    type: '${';
    children: (MMNodeScope | MMNodeC | MMNodeV | MMNodeLabel | MMComment | string)[];
}

export interface MMNodeMM extends Pick<MMNodeScope, 'children'> {
    type: 'root';
}

export type MMNode = MMNodeMM | MMNodeC | MMNodeV | MMNodeLabel | MMNodeScope | MMNodeF | MMNodeA | MMNodeE | MMNodeP;
