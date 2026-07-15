import api from "./api";

export const createPrediction = async (data) => {
  const response = await api.post("/predict", data);
  return response.data;
};

export const getPredictions = async () => {
  const response = await api.get("/predictions");
  return response.data;
};

export const updatePrediction = async (id, data) => {
  const response = await api.put(`/predictions/${id}`, data);
  return response.data;
};

export const deletePrediction = async (id) => {
  const response = await api.delete(`/predictions/${id}`);
  return response.data;
};