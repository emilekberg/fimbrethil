import typescript from '@rollup/plugin-typescript';

const cjs = {
  input: 'src/index.ts',
  output: {
    entryFileNames: '[name].js',
    dir: 'dist',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    typescript({
      typescript: require('typescript'),
      outDir: './dist',
      declarationDir: './dist/types',
      include: [
        './src/**/*.ts',
      ],
      exclude: [
        './src/**/*.spec.ts',
      ]
    })
  ]
};
const es = {
  ...cjs,
  output: {
    ...cjs.output,
    dir: 'dist/es',
    format: 'es',
    sourcemap: true
  }
}
export default [
  cjs
]