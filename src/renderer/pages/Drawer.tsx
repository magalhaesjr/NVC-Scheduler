import Drawer from '@mui/material/Drawer';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AppsIcon from '@mui/icons-material/Apps';
import List from '@mui/material/List';
import { useTheme } from '@mui/material';

// Output Drawer
const OutDrawer = () => {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        position: 'relative',
        width: '180px',
        flexShrink: 0,
        display: 'block',
        anchor: 'left',
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.primary.main,
          color: 'rgba(225,249,27,1)',
          width: '180px',
          display: 'block',
        },
      }}
    >
      <div>
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <AppsIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default OutDrawer;
