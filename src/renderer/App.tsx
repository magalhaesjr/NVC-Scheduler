import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from '@mui/system';
import { useAppDispatch } from './redux/hooks';
import { loadTemplates } from './redux/template';
import theme from './theme';
import './App.css';
import Layout from './pages/Layout';
import Main from './pages/Main';

export default function App() {
  const dispatch = useAppDispatch();
  // Load all templates from database
  useEffect(() => {
    dispatch(loadTemplates());
  }, [dispatch]);

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
