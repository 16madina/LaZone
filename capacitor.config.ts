import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8555b7d95bbc422ab78d1f70f2b81296',
  appName: 'lazoneapp',
  webDir: 'dist',
  server: {
    url: 'https://8555b7d9-5bbc-422a-b78d-1f70f2b81296.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: true,
    backgroundColor: '#fafaf8'
  },
  android: {
    backgroundColor: '#fafaf8',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Support for foldables and large screens
    minWebViewVersion: 60,
    overrideUserAgent: 'LaZone Mobile App'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#fafaf8',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ea580c'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Camera: {
      presentationStyle: 'fullScreen'
    }
  }
};

export default config;
