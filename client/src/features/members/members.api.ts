import http from "../../api/http";

export const getMembers = (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
  const { page = 1, limit = 10, search = "", status } = params;
  let url = `/members?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
  if (status) url += `&status=${status}`;
  return http.get(url);
};
export const createMember = (payload: Record<string, unknown>) => http.post("/members", payload);
export const updateMember = (id: string, payload: Record<string, unknown>) => http.put(`/members/${id}`, payload);
export const deleteMember = (id: string) => http.delete(`/members/${id}`);
export const searchMembers = (q: string, page = 1, limit = 10) =>
  http.get(`/members/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
export const assignPlanToMember = (memberId: string, payload: { planId: string; membershipStartDate?: string }) =>
  http.patch(`/members/${memberId}/assign-plan`, payload);
export const getMyProfile = () => http.get("/members/profile/me");
export const updateMyProfile = (payload: { name?: string; phone?: string; email?: string; photo?: string }) =>
  http.patch("/members/profile/me", payload);
