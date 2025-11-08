import React, { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import { httpClient } from '../api/httpClient.js';
import dayjs from 'dayjs';

const actorOptions = [
  { value: 'je_admin', label: 'JE 管理' },
  { value: 'store', label: 'スーパー店舗' },
  { value: 'wholesaler', label: '野菜王' },
  { value: 'facility', label: 'ほっこり' }
];

export function AdminLogs() {
  const [filters, setFilters] = useState({ type: '', actorRole: '', from: '', to: '' });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return `/logs?${params.toString()}`;
  }, [filters]);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFetchLogs = async () => {
    try {
      setError(null);
      const response = await httpClient.get(queryString);
      setLogs(response.data);
    } catch (err) {
      setError(err);
    }
  };

  const handleExportCsv = () => {
    if (!logs.length) return;
    const header = ['日時', '実行組織', '種別', '関連商品', '金額', 'メッセージ'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.actor,
      log.type,
      log.relatedProduct ?? '-',
      log.amount ?? 0,
      log.message
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
    link.click();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        取引ログ
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="ログ種別"
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        />
        <TextField
          select
          label="実行組織"
          name="actorRole"
          value={filters.actorRole}
          onChange={handleFilterChange}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">すべて</MenuItem>
          {actorOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="開始日"
          name="from"
          type="date"
          value={filters.from}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="終了日"
          name="to"
          type="date"
          value={filters.to}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleFetchLogs}>
          検索
        </Button>
        <Button variant="outlined" onClick={handleExportCsv}>
          CSVエクスポート
        </Button>
      </Stack>
      {error && <Alert severity="error">ログの取得に失敗しました</Alert>}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>日時</TableCell>
            <TableCell>実行組織</TableCell>
            <TableCell>種別</TableCell>
            <TableCell>関連商品</TableCell>
            <TableCell>金額</TableCell>
            <TableCell>内容</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>{log.actor}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.relatedProduct ?? '-'}</TableCell>
                <TableCell>{log.amount ?? 0}</TableCell>
                <TableCell>{log.message}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>ログがありません</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
