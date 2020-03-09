import typescript from '@rollup/plugin-typescript';

const packages = {
    name: "fimbrethil"
}
export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: `dist/${packages.name}.es.js`,
                format: 'es',
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.cjs.js`,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.umd.js`,
                format: 'umd',
                name: `${packages.name}`,
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.iife.js`,
                format: 'iife',
                name: `${packages.name}`,
                sourcemap: true
            }
        ],
        plugins: [
            typescript({
                typescript: require('typescript'),
                include: [
                    './src/**/*.ts',
                ],
                exclude: [
                    './src/**/*.spec.ts',
                ]
            })
        ]
    },
    {
        input: 'src/index.ts',
        output: [
            {
                file: `dist/${packages.name}.es.production.js`,
                format: 'es',
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.cjs.production.js`,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.umd.production.js`,
                format: 'umd',
                name: `${packages.name}`,
                sourcemap: true
            },
            {
                file: `dist/${packages.name}.iife.production.js`,
                format: 'iife',
                name: `${packages.name}`,
                sourcemap: true
            }
        ],
        plugins: [
            typescript({
                typescript: require('typescript'),
                include: [
                    './src/**/*.ts',
                ],
                exclude: [
                    './src/**/*.spec.ts',
                ]
            })
        ]
    }
]