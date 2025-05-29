
import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://auth:3000';

export async function getUserById(userId: number) {
  const res = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
  return res.data;
}
