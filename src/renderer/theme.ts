import { SystemStyleObject } from '@mui/system';
import { createTheme, Theme } from '@mui/material/styles';
import darkScrollbar from '@mui/material/darkScrollbar';
import createCache from '@emotion/cache';

declare module '@mui/material/styles/createPalette' {
  export interface TypeBackground {
    defaultGradient: string;
    paperGradient: string;
    dark: string;
    light: string;
  }
}

declare module '@mui/material/styles/createTheme' {
  export interface Theme {
    sizes: Record<string, number>;
  }
  export interface ThemeOptions {
    sizes: Record<string, number>;
  }
}

declare module '@mui/material/styles' {
  export type Style = Record<string, SystemStyleObject<Theme> | ((t: Theme) => SystemStyleObject<Theme>)>;
}

const fontFamily = 'sans-serif';

export const createEmotionCache = () => createCache({ key: 'css' });

export default createTheme({
  sizes: {},
  typography: {
    h1: {
      fontFamily,
    },
    h2: {
      fontFamily,
    },
    h3: {
      fontFamily,
    },
    h4: {
      fontFamily,
    },
    h5: {
      fontFamily,
    },
    h6: {
      fontFamily,
    },
    button: {
      fontFamily,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...darkScrollbar(),
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        content: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#FE5000',
      paper: '#FE5000',
    },
  },
});
