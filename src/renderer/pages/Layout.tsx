// Creates main layout of app
import { ReactNode } from 'react';
import { Box } from '@mui/material';
// components of webpage
import OutDrawer from './Drawer';

// Defines Property as a non-null ReactNode
type Props = {
  children: NonNullable<ReactNode>;
};

// Layout component
// The layout can take any react component and
// place it in the main tag within this component
// eslint-disable-next-line react/prop-types
const Layout: React.FC<Props> = ({ children }) => {
  return (
    <Box
      sx={{
        flexDirection: 'column',
        display: 'block',
        overflow: 'auto',
      }}
    >
      <Box>
        <OutDrawer />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            flex: 1,
            marginLeft: '180px',
            width: 'auto',
            p: 3,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
