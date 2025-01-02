const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Load env file
  const env = dotenv.config({ path: 'web/.env.local' }).parsed;

  config.ignoreWarnings = [/Failed to parse source map/];
  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify'),
    process: require.resolve('process/browser'),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Add environment variables
    new webpack.DefinePlugin({
      'process.env.NX_REACT_APP_RPC_URL': JSON.stringify(
        env?.NX_REACT_APP_RPC_URL || process.env.NX_REACT_APP_RPC_URL
      ),
    })
  );

  return config;
});