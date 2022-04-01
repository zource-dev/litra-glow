/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import Path from 'path';
import { promises as Fs, constants } from 'fs';

export const loadConfig = async (path: string, defaultConfig: any) => {
  const notFound = await Fs.access(path, constants.F_OK).catch(Boolean);
  if (notFound) {
    return defaultConfig;
  }
  return JSON.parse(await Fs.readFile(path, 'utf8'));
};

export const saveConfig = async (path: string, config: any) => {
  await Fs.writeFile(path, JSON.stringify(config));
};

export let resolveHtmlPath: (htmlFileName: string, data?: any) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string, data: any = {}) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    url.searchParams.set('data', JSON.stringify(data));
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string, data: any = {}) => {
    return `file://${Path.resolve(__dirname, '../renderer/', htmlFileName)}?data=${encodeURIComponent(JSON.stringify(data))}`;
  };
}
