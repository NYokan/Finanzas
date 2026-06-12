module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Permite importar las migraciones .sql de drizzle como strings
      ['inline-import', { extensions: ['.sql'] }],
    ],
  };
};
