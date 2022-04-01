import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';

const data = {
  config: {
    brightness: 50,
    temperature: 4000,
  },
};

describe('App', () => {
  it('should render', () => {
    expect(render(<App config={data.config} />)).toBeTruthy();
  });
});
