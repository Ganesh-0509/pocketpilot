import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pocketpilot.app',
  appName: 'PocketPilot',
  webDir: 'out',
  
  // Android-specific configuration
  android: {
    backgroundColor: '#0D1B3E', // Navy theme
    allowMixedContent: false,
  },
  
  // iOS-specific configuration
  ios: {
    backgroundColor: '#0D1B3E', // Navy theme
  },
  
  // Plugin configuration
  plugins: {
    StatusBar: {
      style: 'DARK', // Dark status bar for light navbar content
      backgroundColor: '#0D1B3E',
      overlaysWebView: false, // Status bar doesn't overlap web content
    },
    PullToRefresh: {
      threshold: 50,
      debounceMs: 1000,
    },
    Haptics: {
      enabled: true,
    },
    // Keyboard plugin configuration
    Keyboard: {
      resizeOnFullScreen: true,
      hideFormAccessoryBar: false,
    },
    // SafeArea plugin for notch handling
    SafeArea: {
      offset: 0,
    },
  },

  // Server configuration for development
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false, // Disable cleartext in production
  },
};

export default config;
