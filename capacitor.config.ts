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
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#fafaf8'
  }
};

export default config;
