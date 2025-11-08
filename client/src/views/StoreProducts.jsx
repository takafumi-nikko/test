import React, { useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { httpClient } from '../api/httpClient.js';
import { useFetch } from '../hooks/useFetch.js';

export function StoreProducts() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', supplier: '野菜王', price: 0, status: 'available' });
  const [editingProduct, setEditingProduct] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  }, [filters]);

  const { data: products, loading, refetch } = useFetch(queryString);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleOpenDialog = (product) => {
    setEditingProduct(product ?? null);
    setForm(product ?? { name: '', supplier: '野菜王', price: 0, status: 'available' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = { ...form, price: Number(form.price) };
    if (editingProduct) {
      await httpClient.put(`/products/${editingProduct.id}`, payload);
    } else {
      await httpClient.post('/products', payload);
    }
    setDialogOpen(false);
    refetch();
  };

  const handleDelete = async (product) => {
    await httpClient.delete(`/products/${product.id}`);
    refetch();
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        商品管理（スーパー店舗）
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="商品名 / JAN"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            fullWidth
          />
          <TextField
            select
            label="ステータス"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">すべて</MenuItem>
            <MenuItem value="available">販売中</MenuItem>
            <MenuItem value="unavailable">停止</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            新規商品登録
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>商品名</TableCell>
              <TableCell>仕入れ元</TableCell>
              <TableCell>価格</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>読み込み中...</TableCell>
              </TableRow>
            ) : products?.length ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.supplier}</TableCell>
                  <TableCell>{product.price.toLocaleString()} 円</TableCell>
                  <TableCell>{product.status === 'available' ? '販売中' : '停止'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>該当する商品がありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingProduct ? '商品編集' : '新規商品登録'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="商品名"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <TextField
              label="仕入れ元"
              name="supplier"
              value={form.supplier}
              onChange={handleFormChange}
              required
            />
            <TextField
              label="価格"
              name="price"
              type="number"
              value={form.price}
              onChange={handleFormChange}
            />
            <TextField
              select
              label="ステータス"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <MenuItem value="available">販売中</MenuItem>
              <MenuItem value="unavailable">停止</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button variant="contained" onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
