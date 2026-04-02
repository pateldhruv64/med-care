/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();
const DEFAULT_ACCENT_COLOR = '#06b6d4';
const PRESET_VALUES = ['default', 'soft', 'contrast'];
const DENSITY_VALUES = ['comfortable', 'compact'];

const getStoredValue = (key, fallback, allowedValues) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return fallback;
  }

  if (allowedValues && !allowedValues.includes(value)) {
    return fallback;
  }

  return value;
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [lightPreset, setLightPreset] = useState(() =>
    getStoredValue('lightPreset', 'default', PRESET_VALUES),
  );
  const [accentColor, setAccentColor] = useState(() =>
    getStoredValue('accentColor', DEFAULT_ACCENT_COLOR),
  );
  const [density, setDensity] = useState(() =>
    getStoredValue('uiDensity', 'comfortable', DENSITY_VALUES),
  );

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lightPreset', lightPreset);

    PRESET_VALUES.forEach((preset) => {
      document.documentElement.classList.remove(`light-preset-${preset}`);
    });

    document.documentElement.classList.add(`light-preset-${lightPreset}`);
    document.documentElement.dataset.lightPreset = lightPreset;
  }, [lightPreset]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('uiDensity', density);

    DENSITY_VALUES.forEach((item) => {
      document.documentElement.classList.remove(`density-${item}`);
    });

    document.documentElement.classList.add(`density-${density}`);
    document.documentElement.dataset.uiDensity = density;
  }, [density]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const resetAppearance = () => {
    setLightPreset('default');
    setAccentColor(DEFAULT_ACCENT_COLOR);
    setDensity('comfortable');
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        lightPreset,
        setLightPreset,
        accentColor,
        setAccentColor,
        density,
        setDensity,
        resetAppearance,
        presetOptions: PRESET_VALUES,
        densityOptions: DENSITY_VALUES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
