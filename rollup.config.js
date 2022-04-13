import typescript from '@rollup/plugin-typescript';

const cjs = {
  input: 'src/index.ts',
  output: {
    entryFileNames: '[name].js',
    dir: 'dist/cjs',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      typescript: require('typescript'),
      module: 'es2020',
      include: [
        './src/**/*.ts',
      ],
      exclude: [
        './src/**/*.spec.ts',
      ]
    })
  ]
};
const esm = {
  ...cjs,
  output: {
    ...cjs.output,
    dir: 'dist/es',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    ...cjs.plugins
  ]
}
const iife = {
  ...cjs,
  output: {
    ...cjs.output,
    dir: 'dist/iife',
    format: 'iife',
    sourcemap: true,
    name: 'fimbrethil'
  },
  plugins: [
    ...cjs.plugins
  ]
}
export default [
  cjs, esm, iife
]