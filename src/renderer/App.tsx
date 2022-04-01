import { useState, useEffect } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';

import CoffeeIcon from '@mui/icons-material/Coffee';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloseIcon from '@mui/icons-material/Close';

import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import LightColdIcon from '@mui/icons-material/AcUnit';
import LightWarmIcon from '@mui/icons-material/LocalFireDepartment';

import theme, { createEmotionCache } from './theme';

const globalStyle = (
  <GlobalStyles
    styles={{
      'html,body,#__next': {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: '100%',
        margin: 0,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.contrastText,
      },
    }}
  />
);

const emotionCache = createEmotionCache();

export interface Props {
  config: any;
}

export default function App({ config }: Props) {
  const [state, setState] = useState(false);
  const [brightness, setBrightness] = useState(config.brightness);
  const [temperature, setTemperature] = useState(config.temperature);

  useEffect(() => {
    window.electron?.litra.setState(state);
    window.electron?.litra.setBrightness(brightness);
    window.electron?.litra.setTemperature(temperature);
  }, []);

  useEffect(() => {
    window.electron?.saveConfig({
      brightness,
      temperature,
    });
  }, [brightness, temperature]);

  const handleStateChange = (value: boolean) => {
    setState(value);
    window.electron.litra.setState(value);
  };

  const handleBrightnessChange = (value: number) => {
    window.electron.litra.setBrightness(value);
    setBrightness(value);
  };

  const handleTemperatureChange = (value: number) => {
    window.electron.litra.setTemperature(value);
    setTemperature(value);
  };

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyle}
        <AppBar position="static">
          <Toolbar sx={{ p: 0 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, pl: 2, pr: 1, WebkitAppRegion: 'drag' }}>
              LITRA
            </Typography>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 100, flexGrow: 1, WebkitAppRegion: 'drag' }}>
              GLOW
            </Typography>
            <IconButton aria-label="donate" sx={{ width: 48, height: 48 }} onClick={window.electron?.win.donate}>
              <CoffeeIcon />
            </IconButton>
            <IconButton aria-label="minimize" sx={{ borderRadius: 0, width: 48, height: 48 }} onClick={window.electron?.win.minimize}>
              <MinimizeIcon />
            </IconButton>
            <IconButton aria-label="close" sx={{ borderRadius: 0, width: 48, height: 48 }} onClick={window.electron?.win.close}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Paper sx={{ m: 2, p: 2 }}>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <BrightnessLowIcon />
            <Slider
              aria-label="Brightness"
              min={1}
              max={100}
              value={brightness}
              valueLabelDisplay="auto"
              onChange={(_, level) => setBrightness(level as number)}
              onChangeCommitted={(_, level) => handleBrightnessChange(level as number)}
            />
            <BrightnessHighIcon />
          </Stack>
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <LightWarmIcon />
            <Slider
              aria-label="Temperature"
              min={2700}
              max={6500}
              step={100}
              value={temperature}
              valueLabelDisplay="auto"
              onChange={(_, level) => setTemperature(level as number)}
              onChangeCommitted={(_, level) => handleTemperatureChange(level as number)}
            />
            <LightColdIcon />
          </Stack>
          <FormControlLabel control={<Switch checked={state} onChange={(event) => handleStateChange(event.target.checked)} color="primary" />} label="Power" />
        </Paper>
      </ThemeProvider>
    </CacheProvider>
  );
}
