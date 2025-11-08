import { nanoid } from 'nanoid';

const roles = {
  ADMIN: 'je_admin',
  STORE: 'store',
  WHOLESALER: 'wholesaler',
  FACILITY: 'facility'
};

const users = [
  {
    id: 'u-admin',
    name: 'JE 本部',
    organization: 'JE 運営',
    role: roles.ADMIN,
    email: 'admin@je.co.jp',
    status: 'active',
    password: 'admin123'
  },
  {
    id: 'u-store-1',
    name: 'ニッコー堺店',
    organization: 'スーパー・ニッコー堺',
    role: roles.STORE,
    email: 'sakai@nikko.jp',
    status: 'active',
    password: 'sakai123'
  },
  {
    id: 'u-wholesaler',
    name: '野菜王 担当',
    organization: '野菜王',
    role: roles.WHOLESALER,
    email: 'order@veggie-king.jp',
    status: 'active',
    password: 'veggie123'
  },
  {
    id: 'u-facility',
    name: 'ほっこり 事務局',
    organization: '福祉施設ほっこり',
    role: roles.FACILITY,
    email: 'hello@hokkori.jp',
    status: 'active',
    password: 'hokkori123'
  }
];

const products = [
  {
    id: 'p-001',
    name: '有機きゅうり 10kg',
    supplier: '野菜王',
    category: '野菜',
    janCode: '4901234567890',
    price: 4800,
    status: 'available',
    inventory: 24,
    imageUrl: 'https://placehold.co/160x120?text=きゅうり'
  },
  {
    id: 'p-002',
    name: '減農薬トマト 5kg',
    supplier: '野菜王',
    category: '野菜',
    janCode: '4901234567891',
    price: 3600,
    status: 'available',
    inventory: 18,
    imageUrl: 'https://placehold.co/160x120?text=トマト'
  },
  {
    id: 'p-003',
    name: 'さつまいもピューレ 2kg',
    supplier: '野菜王',
    category: '加工品',
    janCode: '4901234567892',
    price: 2200,
    status: 'unavailable',
    inventory: 0,
    imageUrl: 'https://placehold.co/160x120?text=さつまいも'
  }
];

const orders = [
  {
    id: 'o-001',
    storeId: 'u-store-1',
    facilityId: 'u-facility',
    status: 'pending',
    createdAt: new Date().toISOString(),
    items: [
      { id: nanoid(), productId: 'p-001', quantity: 3, price: 4800 },
      { id: nanoid(), productId: 'p-002', quantity: 2, price: 3600 }
    ]
  }
];

const logs = [
  {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'system',
    relatedProduct: 'p-001',
    amount: 0,
    message: 'システム初期化'
  }
];

export function getUsers(filter = {}) {
  const { role, status, search } = filter;
  return users.filter((user) => {
    if (role && user.role !== role) return false;
    if (status && user.status !== status) return false;
    if (search && !`${user.name} ${user.organization} ${user.email}`.includes(search)) {
      return false;
    }
    return true;
  });
}

export function addUser(payload) {
  const newUser = {
    id: nanoid(),
    status: 'active',
    ...payload
  };
  users.push(newUser);
  addLog({
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'user_create',
    message: `ユーザー「${newUser.name}」を追加`
  });
  return newUser;
}

export function updateUser(id, payload) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...payload };
  addLog({
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'user_update',
    message: `ユーザー「${users[index].name}」を更新`
  });
  return users[index];
}

export function toggleUserStatus(id, status) {
  return updateUser(id, { status });
}

export function getProducts(filter = {}) {
  const { supplier, category, status, search } = filter;
  return products.filter((product) => {
    if (supplier && product.supplier !== supplier) return false;
    if (category && product.category !== category) return false;
    if (status && product.status !== status) return false;
    if (
      search &&
      !`${product.name} ${product.janCode} ${product.supplier}`.includes(search)
    ) {
      return false;
    }
    return true;
  });
}

export function addProduct(payload) {
  const newProduct = {
    id: nanoid(),
    status: 'available',
    inventory: 0,
    ...payload
  };
  products.push(newProduct);
  addLog({
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'product_create',
    relatedProduct: newProduct.id,
    message: `商品「${newProduct.name}」を登録`
  });
  return newProduct;
}

export function updateProduct(id, payload) {
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...payload };
  addLog({
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'product_update',
    relatedProduct: id,
    message: `商品「${products[index].name}」を更新`
  });
  return products[index];
}

export function removeProduct(id) {
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return false;
  const [removed] = products.splice(index, 1);
  addLog({
    actor: 'JE 本部',
    actorRole: roles.ADMIN,
    type: 'product_delete',
    relatedProduct: id,
    message: `商品「${removed.name}」を削除`
  });
  return true;
}

export function getOrders(filter = {}) {
  const { status, storeId, facilityId } = filter;
  return orders.filter((order) => {
    if (status && order.status !== status) return false;
    if (storeId && order.storeId !== storeId) return false;
    if (facilityId && order.facilityId !== facilityId) return false;
    return true;
  });
}

export function addOrder(payload) {
  const newOrder = {
    id: nanoid(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    items: [],
    ...payload
  };
  orders.push(newOrder);
  addLog({
    actor: payload.facilityName ?? 'ほっこり',
    actorRole: roles.FACILITY,
    type: 'order_create',
    amount: calculateOrderTotal(newOrder),
    message: `注文「${newOrder.id}」を作成`
  });
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const order = orders.find((item) => item.id === id);
  if (!order) return null;
  order.status = status;
  addLog({
    actor: '野菜王',
    actorRole: roles.WHOLESALER,
    type: 'order_update',
    amount: calculateOrderTotal(order),
    message: `注文「${order.id}」のステータスを${status}に更新`
  });
  return order;
}

export function cancelOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return null;
  order.status = 'cancelled';
  addLog({
    actor: 'ほっこり',
    actorRole: roles.FACILITY,
    type: 'order_cancel',
    amount: calculateOrderTotal(order),
    message: `注文「${order.id}」をキャンセル`
  });
  return order;
}

export function addOrderItem(orderId, item) {
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  const orderItem = { id: nanoid(), ...item };
  order.items.push(orderItem);
  order.status = 'pending';
  return orderItem;
}

export function getLogs(filter = {}) {
  const { type, actorRole, from, to } = filter;
  return logs.filter((log) => {
    if (type && log.type !== type) return false;
    if (actorRole && log.actorRole !== actorRole) return false;
    if (from && new Date(log.createdAt) < new Date(from)) return false;
    if (to && new Date(log.createdAt) > new Date(to)) return false;
    return true;
  });
}

export function addLog(payload) {
  const log = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    amount: 0,
    ...payload
  };
  logs.unshift(log);
  return log;
}

export function calculateOrderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getDashboardSummary() {
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const todayOrders = orders.filter((order) => {
    const created = new Date(order.createdAt);
    const now = new Date();
    return (
      created.getDate() === now.getDate() &&
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  const pendingAlerts = orders
    .filter((order) => order.status === 'pending')
    .map((order) => ({
      id: order.id,
      message: `注文 ${order.id} が出荷待ちです`,
      createdAt: order.createdAt
    }));

  const recentLogs = logs.slice(0, 5);

  return {
    totalUsers,
    totalOrders,
    todayOrders,
    pendingAlerts,
    recentLogs
  };
}

export { roles };
