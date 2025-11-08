import express from 'express';
import cors from 'cors';
import {
  roles,
  getUsers,
  addUser,
  updateUser,
  toggleUserStatus,
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
  getOrders,
  addOrder,
  addOrderItem,
  updateOrderStatus,
  cancelOrder,
  getLogs,
  getDashboardSummary
} from './data.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function authenticate(req, res, next) {
  const authHeader = req.headers['x-user-id'];
  if (!authHeader) {
    return res.status(401).json({ message: '認証情報が必要です' });
  }
  req.userId = authHeader;
  next();
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const candidates = getUsers({});
  const user = candidates.find((item) => item.email === email && item.password === password);
  if (!user) {
    return res.status(401).json({ message: 'メールアドレスまたはパスワードが違います' });
  }
  const { password: _ignored, ...payload } = user;
  res.json({ user: payload });
});

app.get('/api/dashboard', authenticate, (req, res) => {
  res.json(getDashboardSummary());
});

app.get('/api/users', authenticate, (req, res) => {
  const { role, status, search } = req.query;
  const users = getUsers({ role, status, search });
  res.json(users.map(stripSensitiveUserInfo));
});

app.post('/api/users', authenticate, (req, res) => {
  const payload = req.body;
  if (!payload.name || !payload.organization || !payload.role || !payload.email) {
    return res.status(400).json({ message: '必須項目が不足しています' });
  }
  const newUser = addUser(payload);
  res.status(201).json(stripSensitiveUserInfo(newUser));
});

app.put('/api/users/:id', authenticate, (req, res) => {
  const updated = updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: 'ユーザーが見つかりません' });
  }
  res.json(stripSensitiveUserInfo(updated));
});

app.patch('/api/users/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'ステータスが必要です' });
  }
  const updated = toggleUserStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ message: 'ユーザーが見つかりません' });
  }
  res.json(stripSensitiveUserInfo(updated));
});

app.get('/api/products', authenticate, (req, res) => {
  const { supplier, category, status, search } = req.query;
  const list = getProducts({ supplier, category, status, search });
  res.json(list);
});

app.post('/api/products', authenticate, (req, res) => {
  const { name, supplier, price } = req.body;
  if (!name || !supplier || typeof price === 'undefined') {
    return res.status(400).json({ message: '商品名・仕入れ元・価格は必須です' });
  }
  const product = addProduct(req.body);
  res.status(201).json(product);
});

app.put('/api/products/:id', authenticate, (req, res) => {
  const updated = updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ message: '商品が見つかりません' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', authenticate, (req, res) => {
  const removed = removeProduct(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: '商品が見つかりません' });
  }
  res.status(204).send();
});

app.get('/api/orders', authenticate, (req, res) => {
  const { status, storeId, facilityId } = req.query;
  const list = getOrders({ status, storeId, facilityId });
  res.json(list);
});

app.post('/api/orders', authenticate, (req, res) => {
  const { storeId, facilityId, items } = req.body;
  if (!storeId || !facilityId) {
    return res.status(400).json({ message: '店舗IDと施設IDは必須です' });
  }
  const order = addOrder({ storeId, facilityId, items });
  res.status(201).json(order);
});

app.post('/api/orders/:id/items', authenticate, (req, res) => {
  const { productId, quantity, price } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ message: '商品IDと数量は必須です' });
  }
  const item = addOrderItem(req.params.id, { productId, quantity, price });
  if (!item) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }
  res.status(201).json(item);
});

app.patch('/api/orders/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: 'ステータスが必要です' });
  }
  const updated = updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }
  res.json(updated);
});

app.post('/api/orders/:id/cancel', authenticate, (req, res) => {
  const cancelled = cancelOrder(req.params.id);
  if (!cancelled) {
    return res.status(404).json({ message: '注文が見つかりません' });
  }
  res.json(cancelled);
});

app.get('/api/logs', authenticate, (req, res) => {
  const { type, actorRole, from, to } = req.query;
  const list = getLogs({ type, actorRole, from, to });
  res.json(list);
});

app.use((req, res) => {
  res.status(404).json({ message: 'エンドポイントが見つかりません' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

function stripSensitiveUserInfo(user) {
  const { password, ...rest } = user;
  return rest;
}

export { roles };
