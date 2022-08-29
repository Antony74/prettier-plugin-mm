export interface MMComment {
    type: '$(';
    text: string;
}

export interface MMNodeC {
    type: '$c';
    children: (string | MMComment)[];
}

export interface MMNodeMM {
    type: 'root';
    children: (MMNodeC | MMComment | string)[];
}

export type MMNode = MMNodeMM | MMNodeC;
