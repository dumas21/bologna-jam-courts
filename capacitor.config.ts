
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d01073df498e488bbe4bef189a39047d',
  appName: 'Playground Jam',
  webDir: 'dist',
  server: {
    url: 'https://d01073df-498e-488b-be4b-ef189a39047d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#1A1F2C",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
  android: {
    backgroundColor: "#1A1F2C"
  },
  ios: {
    backgroundColor: "#1A1F2C"
  }
};

export default config;
