import React, { useMemo, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { httpClient } from '../api/httpClient.js';
import { useFetch } from '../hooks/useFetch.js';
import Alert from '@mui/material/Alert';

const roleOptions = [
  { value: 'je_admin', label: 'JE 管理者' },
  { value: 'store', label: 'スーパー店舗' },
  { value: 'wholesaler', label: '野菜王' },
  { value: 'facility', label: 'ほっこり' }
];

export function AdminUsers() {
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    organization: '',
    role: 'store',
    email: '',
    status: 'active'
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    return query ? `/users?${query}` : '/users';
  }, [filters]);

  const { data: users, loading, error, refetch } = useFetch(queryString);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleOpenDialog = (user) => {
    setEditingUser(user ?? null);
    setForm(
      user ?? {
        name: '',
        organization: '',
        role: 'store',
        email: '',
        status: 'active'
      }
    );
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSave = async () => {
    if (editingUser) {
      await httpClient.put(`/users/${editingUser.id}`, form);
    } else {
      await httpClient.post('/users', form);
    }
    setDialogOpen(false);
    refetch();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await httpClient.patch(`/users/${user.id}/status`, { status: newStatus });
    refetch();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        ユーザー管理
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="キーワード"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          fullWidth
        />
        <TextField
          select
          label="種別"
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">すべて</MenuItem>
          {roleOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="ステータス"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">すべて</MenuItem>
          <MenuItem value="active">有効</MenuItem>
          <MenuItem value="suspended">停止</MenuItem>
        </TextField>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          新規追加
        </Button>
      </Stack>
      {error && <Alert severity="error">ユーザーデータの取得に失敗しました</Alert>}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>組織名</TableCell>
            <TableCell>種別</TableCell>
            <TableCell>ステータス</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>読み込み中...</TableCell>
            </TableRow>
          ) : users?.length ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{user.organization}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>{roleOptions.find((item) => item.value === user.role)?.label}</TableCell>
                <TableCell>{user.status === 'active' ? '有効' : '停止'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleStatus(user)}>
                    {user.status === 'active' ? <ToggleOffIcon /> : <ToggleOnIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>該当するユーザーがいません</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingUser ? 'ユーザー編集' : '新規ユーザー追加'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="担当者名"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <TextField
              label="組織名"
              name="organization"
              value={form.organization}
              onChange={handleFormChange}
              required
            />
            <TextField
              select
              label="ユーザー種別"
              name="role"
              value={form.role}
              onChange={handleFormChange}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="メールアドレス"
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
