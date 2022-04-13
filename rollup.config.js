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
    typescript({
      typescript: require('typescript'),
    })
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
    typescript({
      typescript: require('typescript'),
    })
  ]
}
export default [
  cjs, esm, iife
]