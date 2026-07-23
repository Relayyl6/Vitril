const { withNativeWind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname, {
  // This line forces Metro to bypass the buggy native Windows file system watcher
  unstable_enableNodeWatcher: true, 
});

module.exports = withNativeWind(config, { input: "./global.css" });