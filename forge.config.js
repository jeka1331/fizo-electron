// If you have set config.forge to a JavaScript file path in package.json:
// Only showing the relevant configuration for brevity
module.exports = {
    makers: [
      {
        name: '@electron-forge/maker-zip',
        platforms: ['darwin', 'linux'],
        config: {
          // Config here
        }
      },
      {
        name: '@electron-forge/maker-wix',
        config: {
          language: 1033,
          manufacturer: 'My Awesome Company'
        }
      }
    ]
  };