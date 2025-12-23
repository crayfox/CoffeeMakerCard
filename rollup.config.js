import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import importCss from 'rollup-plugin-import-css';
import url from '@rollup/plugin-url';

export default {
  input: 'src/coffeemaker-card.js',
  output: {
    file: 'dist/coffeemaker-card.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    resolve(),
    commonjs(),
    importCss({
      inject: true,
      minify: true,
    }),
    url({
      include: ["**/*.png", "**/*.jpg", "**/*.jpeg"],
      limit: 9999999,
      publicPath: "",
      destDir: "",
    }),
    terser({
      mangle: {
        reserved:["ctx", "key", "value"],
      },
    }),
  ],
};