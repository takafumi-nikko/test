import React, { useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { httpClient } from '../api/httpClient.js';
import { useFetch } from '../hooks/useFetch.js';

const statusOptions = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '出荷待ち' },
  { value: 'shipped', label: '出荷完了' },
  { value: 'cancelled', label: 'キャンセル' }
];

export function WholesalerOrders() {
  const [filters, setFilters] = useState({ status: '' });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const query = params.toString();
    return query ? `/orders?${query}` : '/orders';
  }, [filters]);

  const { data: orders, loading, refetch } = useFetch(queryString);

  const handleFilterChange = (event) => {
    setFilters({ status: event.target.value });
  };

  const handleUpdateStatus = async (orderId, status) => {
    await httpClient.patch(`/orders/${orderId}/status`, { status });
    refetch();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        注文確認（野菜王）
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="ステータス"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 200 }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>注文ID</TableCell>
              <TableCell>施設</TableCell>
              <TableCell>商品数</TableCell>
              <TableCell>合計金額</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>読み込み中...</TableCell>
              </TableRow>
            ) : orders?.length ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.facilityId}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    {order.items
                      .reduce((sum, item) => sum + item.price * item.quantity, 0)
                      .toLocaleString()}{' '}
                    円
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        statusOptions.find((option) => option.value === order.status)?.label ||
                        order.status
                      }
                      color={order.status === 'pending' ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                      >
                        出荷待ち
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      >
                        出荷完了
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>該当する注文がありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
