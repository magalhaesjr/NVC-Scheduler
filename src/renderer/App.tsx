import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { ThemeProvider } from '@mui/system';
import { Season } from '../domain/template';
import { useAppDispatch } from './redux/hooks';
import { changeSeason, loadTemplates } from './redux/template';
import theme from './theme';
import './App.css';
import Layout from './pages/Layout';
import Main from './pages/Main';

export default function App() {
  const dispatch = useAppDispatch();

  // Callback for season change
  const onSeasonChange = useCallback(
    (_, season: Season) => {
      dispatch(changeSeason(season));
    },
    [dispatch]
  );

  // Load all templates from database
  useEffect(() => {
    dispatch(loadTemplates());

    // Set callback for season change
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.api.onSeasonChange(onSeasonChange);
  }, [dispatch, onSeasonChange]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Main />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
