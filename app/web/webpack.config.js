const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Load both .env and .env.local
  const env = {
    ...dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed,
    ...dotenv.config({ path: path.resolve(__dirname, '.env.local') }).parsed
  };

  config.ignoreWarnings = [/Failed to parse source map/];
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify'),
    process: require.resolve('process/browser'),
    "assert": require.resolve("assert/"),
    "util": require.resolve("util/"),
    "path": require.resolve("path-browserify"),
    "fs": false,
  };

  // Debug environment loading
  console.log('Webpack Environment Loading:', {
    envParsed: env,
    dotenvLocal: dotenv.config({ path: path.resolve(__dirname, '.env.local') }).parsed,
    dotenvBase: dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed,
    processEnv: {
      NX_REACT_APP_RPC_URL: process.env.NX_REACT_APP_RPC_URL,
      NX_HELIUS_WEBSOCKET: process.env.NX_HELIUS_WEBSOCKET
    },
    paths: {
      env: path.resolve(__dirname, '.env'),
      envLocal: path.resolve(__dirname, '.env.local')
    }
  });

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NX_REACT_APP_RPC_URL': JSON.stringify(
        env?.NX_REACT_APP_RPC_URL || process.env.NX_REACT_APP_RPC_URL
      ),
      'process.env.NX_HELIUS_WEBSOCKET': JSON.stringify(
        env?.NX_HELIUS_WEBSOCKET || process.env.NX_HELIUS_WEBSOCKET
      )
    })
  );

  return config;
});