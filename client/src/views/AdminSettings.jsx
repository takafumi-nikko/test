import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export function AdminSettings() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        システム設定
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        MVPでは運用通知メールの送信先を設定できるフォームを提供します。
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField label="アラート通知メールアドレス" defaultValue="ops@je.co.jp" />
        <TextField label="日次レポート送信先" defaultValue="report@je.co.jp" />
        <Button variant="contained">保存</Button>
      </Stack>
    </Paper>
  );
}
