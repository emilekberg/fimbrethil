import typescript from '@rollup/plugin-typescript';

const packages = {
  name: "fimbrethil"
}
export default [
  {
    input: 'src/index.ts',
    output: {
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
  }
]