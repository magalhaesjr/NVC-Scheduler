import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import App from '../renderer/App';
import Store from '../renderer/redux/store';

describe('App', () => {
  it('should render', () => {
    expect(
      render(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Provider store={Store}>
            <App />
          </Provider>
        </LocalizationProvider>
      )
    ).toBeTruthy();
  });
});
