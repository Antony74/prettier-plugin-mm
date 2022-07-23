export const languages = [
    {
        extensions: ['.mm'],
        name: 'Metamath',
        parsers: ['mm-parse'],
    },
];

export const parsers = {
    'mm-parse': {
        parse: () => undefined,
        astFormat: 'mm-ast',
        locStart: () => 0,
        locEnd: () => 0,
    },
};
