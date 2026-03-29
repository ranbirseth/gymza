import http from "../../api/http";

export const getPayments = () => http.get("/payments");
export const getPendingDues = () => http.get("/payments/dues");
export const getInvoice = (paymentId: string) => http.get(`/payments/${paymentId}/invoice`);
export const createOnlinePaymentIntent = () => http.post("/payments/online/intent");
export const confirmOnlinePayment = (payload: { intentId: string; member: string; amount: number }) =>
  http.post("/payments/online/confirm", payload);
