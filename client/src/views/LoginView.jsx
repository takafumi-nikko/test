import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { httpClient, setAuthUser } from '../api/httpClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';

const demoAccounts = [
  { email: 'admin@je.co.jp', password: 'admin123', label: 'JE 管理者' },
  { email: 'sakai@nikko.jp', password: 'sakai123', label: 'スーパー店舗' },
  { email: 'order@veggie-king.jp', password: 'veggie123', label: '野菜王' },
  { email: 'hello@hokkori.jp', password: 'hokkori123', label: 'ほっこり' }
];

export function LoginView() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleDemoSelect = (event) => {
    const account = demoAccounts.find((item) => item.email === event.target.value);
    if (account) {
      setForm({ email: account.email, password: account.password });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await httpClient.post('/login', form);
      setUser(response.data.user);
      setAuthUser(response.data.user);
      const nextPath = {
        je_admin: '/admin/dashboard',
        store: '/store',
        wholesaler: '/wholesaler',
        facility: '/facility'
      }[response.data.user.role];
      if (nextPath) {
        navigate(nextPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" textAlign="center">
            スーパーニッコー・サプライチェーン
          </Typography>
          <TextField
            select
            label="デモアカウントを選択"
            value={form.email}
            onChange={handleDemoSelect}
            helperText="選択するとID・パスワードが自動入力されます"
          >
            {demoAccounts.map((account) => (
              <MenuItem key={account.email} value={account.email}>
                {account.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="email"
            label="メールアドレス"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            name="password"
            label="パスワード"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large">
            ログイン
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
