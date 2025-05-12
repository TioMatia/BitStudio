import axios from 'axios';
import baseURLs from './services';

export const authApi = axios.create({ baseURL: baseURLs.auth });
export const storeApi = axios.create({ baseURL: baseURLs.store });
export const inventoryApi = axios.create({ baseURL: baseURLs.inventory });
export const orderApi = axios.create({ baseURL: baseURLs.order });
