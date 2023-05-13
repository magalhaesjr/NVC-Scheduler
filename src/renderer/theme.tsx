import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    layout: {
      drawerWidth: string;
      horzPadding: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    layout?: {
      drawerWidth: string;
      horzPadding?: string;
    };
  }
}

// Export default theme from Material to start
const theme = createTheme({
  layout: {
    drawerWidth: '180px',
    horzPadding: '24px',
  },
});

export default theme;
