// Creates main layout of app
import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
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
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          flexDirection: 'row',
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
      >
        <OutDrawer width={theme.layout.drawerWidth} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            flex: 1,
            margin: 0,
            paddingTop: theme.layout.horzPadding,
            paddingLeft: 0,
            paddingRight: 0,
            display: 'flex',
            minHeight: 0,
            maxHeight: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
