
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d01073df498e488bbe4bef189a39047d',
  appName: 'bologna-jam-courts',
  webDir: 'dist',
  server: {
    url: "https://d01073df-498e-488b-be4b-ef189a39047d.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#1A1F2C",
      showSpinner: true,
      spinnerColor: "#9b87f5"
    }
  }
};

export default config;
