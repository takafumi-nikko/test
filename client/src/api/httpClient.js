import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api'
});

export function setAuthUser(user) {
  if (user?.id) {
    httpClient.defaults.headers.common['x-user-id'] = user.id;
  } else {
    delete httpClient.defaults.headers.common['x-user-id'];
  }
}
