import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import { useFetch } from '../hooks/useFetch.js';

const metricConfigs = [
  { key: 'totalUsers', label: '登録ユーザー数' },
  { key: 'totalOrders', label: '累計注文数' },
  { key: 'todayOrders', label: '本日注文数' }
];

export function AdminDashboard() {
  const { data, loading, error } = useFetch('/dashboard');

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return <Alert severity="error">ダッシュボードデータの取得に失敗しました</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {metricConfigs.map((metric) => (
        <Grid item xs={12} md={4} key={metric.key}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {data?.[metric.key] ?? '-'}
            </Typography>
          </Paper>
        </Grid>
      ))}

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            未対応アラート
          </Typography>
          <List>
            {data?.pendingAlerts?.length ? (
              data.pendingAlerts.map((alert) => (
                <ListItem key={alert.id}>
                  <ListItemText
                    primary={alert.message}
                    secondary={new Date(alert.createdAt).toLocaleString()}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="未対応のアラートはありません" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            直近の取引ログ
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>日時</TableCell>
                <TableCell>種別</TableCell>
                <TableCell>内容</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.recentLogs?.length ? (
                data.recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>ログがありません</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  );
}
