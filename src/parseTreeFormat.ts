export interface MMComment {
    type: '$(';
    text: string;
}

export interface MMNodeC {
    type: '$c';
    children: (string | MMComment)[];
}

export interface MMNodeV {
    type: '$v';
    children: (string | MMComment)[];
}

export interface MMNodeLabel {
    type: 'label';
    label: string;
    children: (string | MMComment)[];
}

export interface MMNodeScope {
    type: '${';
    children: (MMNodeScope | MMNodeC | MMNodeV | MMNodeLabel | MMComment | string)[];
}

export interface MMNodeMM extends Pick<MMNodeScope, 'children'> {
    type: 'root';
}

export type MMNode = MMNodeMM | MMNodeC | MMNodeV | MMNodeLabel | MMNodeScope;
