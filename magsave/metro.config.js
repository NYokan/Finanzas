const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Migraciones .sql de drizzle importadas vía babel-plugin-inline-import
config.resolver.sourceExts.push('sql');

module.exports = withNativeWind(config, { input: './global.css' });
