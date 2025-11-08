import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext.jsx';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8),
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[100]
}));

const NavigationItems = [
  { label: 'ダッシュボード', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'ユーザー管理', icon: <PeopleIcon />, path: '/admin/users' },
  { label: '商品マスタ管理', icon: <InventoryIcon />, path: '/admin/products' },
  { label: '取引ログ', icon: <ReceiptLongIcon />, path: '/admin/logs' },
  { label: 'システム設定', icon: <SettingsIcon />, path: '/admin/settings' }
];

export function AppLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const handleSignOut = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleSignOut}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar>
          <Typography variant="subtitle1">JE 管理メニュー</Typography>
        </Toolbar>
        <Divider />
        <List>
          {NavigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
}

AppLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};
