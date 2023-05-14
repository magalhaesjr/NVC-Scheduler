import Drawer from '@mui/material/Drawer';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AppsIcon from '@mui/icons-material/Apps';
import List from '@mui/material/List';
import { useTheme } from '@mui/material';

export interface DrawerProps {
  width: string;
}

// Output Drawer
const OutDrawer = ({ width }: DrawerProps) => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        anchor: 'left',
        width,
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.primary.main,
          display: 'flex',
          width,
        },
      }}
    >
      <List>
        <ListItem component={Link} to="/">
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="Home" sx={{ color: 'white' }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default OutDrawer;
