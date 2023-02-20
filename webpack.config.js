const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');
const url = require('url')

// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const entry = path.join(__dirname, "src", "index.js");
const outputPath = path.join(__dirname, "./dist");

function makePattern(fileName) {
  return [
    {
      from: path.join(
        __dirname,
        "emscripten-build",
        "pipelines",
        fileName,
        `${fileName}.js`
      ),
      to: path.join(__dirname, "dist", "itk", "pipeline", `${fileName}.js`),
    },
    {
      from: path.join(
        __dirname,
        "emscripten-build",
        "pipelines",
        fileName,
        `${fileName}.wasm`
      ),
      to: path.join(__dirname, "dist", "itk", "pipeline", `${fileName}.wasm`),
    },
  ];
}


module.exports = {
    entry,
    output: {
      path: outputPath,
      filename: "index.js",
      library: {
        type: "umd",
        name: "bundle",
      },
    },
    module: {
      rules: [{ test: /\.js$/, loader: "babel-loader" }],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              __dirname,
              "node_modules",
              "itk-wasm",
              "dist",
              "web-workers"
            ),
            to: path.join(__dirname, "dist", "itk", "web-workers"),
          },
          ...makePattern("convertToPolyData"),
          {
            from: path.join(__dirname, 'node_modules', 'itk-mesh-io'),
            to: path.join(__dirname, 'dist', 'itk', 'mesh-io')
          }
        ],
      }),
    ],
    resolve: {
      fallback: { fs: false, path: false, url: false, module: false },
      alias: {
        '../itkConfig.js': path.resolve(__dirname, 'itkConfig.js'),
        '../../itkConfig.js': path.resolve(__dirname, 'itkConfig.js'),
      },
    },
    performance: {
      maxAssetSize: 10000000,
    },
  }
