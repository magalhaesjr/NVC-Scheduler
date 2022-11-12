import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/system';
import theme from './theme';
import './App.css';
import Layout from './pages/Layout';
import Main from './pages/Main';

export default function App() {
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
