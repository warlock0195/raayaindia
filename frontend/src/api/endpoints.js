import api from "./client";

const unwrap = (res) => res.data?.data ?? res.data;

export const authApi = {
  register: async (payload) => unwrap(await api.post("/auth/register/", payload)),
  login: async (payload) => unwrap(await api.post("/auth/login/", payload)),
  profile: async () => unwrap(await api.get("/auth/profile/")),
  addresses: async () => unwrap(await api.get("/auth/addresses/")),
  createAddress: async (payload) => unwrap(await api.post("/auth/addresses/", payload)),
};

export const productApi = {
  list: async (params = {}) => unwrap(await api.get("/products/", { params })),
  detail: async (slug) => unwrap(await api.get(`/products/${slug}/`)),
};

export const cartApi = {
  getCart: async () => unwrap(await api.get("/cart/")),
  add: async (payload) => unwrap(await api.post("/cart/add/", payload)),
  update: async (id, payload) => unwrap(await api.patch(`/cart/item/${id}/update/`, payload)),
  remove: async (id) => unwrap(await api.delete(`/cart/item/${id}/remove/`)),
};

export const orderApi = {
  checkout: async (payload) => unwrap(await api.post("/orders/checkout/", payload)),
  list: async () => unwrap(await api.get("/orders/")),
  detail: async (id) => unwrap(await api.get(`/orders/${id}/`)),
};

export const paymentApi = {
  createRazorpayOrder: async (payload) => unwrap(await api.post("/payments/razorpay/create-order/", payload)),
  verifyRazorpayPayment: async (payload) => unwrap(await api.post("/payments/razorpay/verify/", payload)),
};

export const analyticsApi = {
  track: async (payload) => unwrap(await api.post("/admin-panel/analytics/track/", payload)),
};

export const reviewApi = {
  listByProduct: async (productId) => unwrap(await api.get(`/reviews/product/${productId}/`)),
  create: async (payload) => unwrap(await api.post("/reviews/", payload)),
};
