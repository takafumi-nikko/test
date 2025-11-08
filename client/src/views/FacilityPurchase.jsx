import React, { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { httpClient } from '../api/httpClient.js';
import { useFetch } from '../hooks/useFetch.js';

export function FacilityPurchase() {
  const [filters, setFilters] = useState({ search: '', supplier: '' });
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    return query ? `/products?${query}` : '/products';
  }, [filters]);

  const { data: products } = useFetch(queryString);

  useEffect(() => {
    const loadOrders = async () => {
      const response = await httpClient.get('/orders?facilityId=u-facility');
      setOrders(response.data ?? []);
    };
    loadOrders();
  }, []);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleOpenOrderDialog = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleCloseOrderDialog = () => {
    setSelectedProduct(null);
  };

  const handlePlaceOrder = async () => {
    const payload = {
      storeId: 'u-store-1',
      facilityId: 'u-facility',
      items: [
        {
          productId: selectedProduct.id,
          quantity,
          price: selectedProduct.price
        }
      ]
    };
    await httpClient.post('/orders', payload);
    const response = await httpClient.get('/orders?facilityId=u-facility');
    setOrders(response.data ?? []);
    setSelectedProduct(null);
  };

  const handleCancelOrder = async (order) => {
    await httpClient.post(`/orders/${order.id}/cancel`);
    const response = await httpClient.get('/orders?facilityId=u-facility');
    setOrders(response.data ?? []);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        購入システム（ほっこり）
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="キーワード"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <TextField
          label="仕入れ元"
          name="supplier"
          value={filters.supplier}
          onChange={handleFilterChange}
        />
      </Stack>
      <Grid container spacing={3}>
        {products?.length ? (
          products.map((product) => (
            <Grid item xs={12} md={4} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={product.imageUrl || 'https://placehold.co/160x120'}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography color="text.secondary">{product.supplier}</Typography>
                  <Typography sx={{ mt: 1 }}>{product.price.toLocaleString()} 円</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" onClick={() => handleOpenOrderDialog(product)}>
                    注文する
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography>表示する商品がありません</Typography>
          </Grid>
        )}
      </Grid>

      <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
        注文履歴
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>注文ID</TableCell>
            <TableCell>商品数</TableCell>
            <TableCell>合計金額</TableCell>
            <TableCell>ステータス</TableCell>
            <TableCell align="right">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>
                  {order.items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toLocaleString()}{' '}
                  円
                </TableCell>
                <TableCell>
                  <Chip
                    label={{ pending: '出荷待ち', shipped: '出荷完了', cancelled: 'キャンセル' }[order.status]}
                    color={order.status === 'cancelled' ? 'default' : 'primary'}
                  />
                </TableCell>
                <TableCell align="right">
                  {order.status === 'pending' && (
                    <Button size="small" color="error" onClick={() => handleCancelOrder(order)}>
                      キャンセル
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>注文履歴がありません</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={Boolean(selectedProduct)} onClose={handleCloseOrderDialog}>
        <DialogTitle>注文を作成</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography>{selectedProduct?.name}</Typography>
            <TextField
              label="数量"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>キャンセル</Button>
          <Button variant="contained" onClick={handlePlaceOrder}>
            注文確定
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
