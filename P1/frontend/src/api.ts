import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getCategories = () => api.get('/categories').then(r => r.data);
export const getCourses    = () => api.get('/courses').then(r => r.data);
export const getCourse     = (id: number) => api.get(`/courses/${id}`).then(r => r.data);
export const getChapters   = (courseId: number) => api.get(`/courses/${courseId}/chapters`).then(r => r.data);

export const getCart        = (userId: number) => api.get(`/cart?userId=${userId}`).then(r => r.data);
export const addToCart      = (userId: number, courseId: number) => api.post('/cart', { userId, courseId }).then(r => r.data);
export const removeFromCart = (userId: number, courseId: number) => api.delete(`/cart/${courseId}?userId=${userId}`).then(r => r.data);

export const createOrder    = (userId: number, courseIds: number[]) => api.post('/orders', { userId, courseIds }).then(r => r.data);

export const getEnrollments = (userId: number) => api.get(`/users/${userId}/courses`).then(r => r.data);
