const API_URL = import.meta.env.VITE_API_URL;
const ML_URL = import.meta.env.VITE_ML_URL;

export async function register(name, email, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function verifyOtp(email, code) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// --- ML ENDPOINTS ---

export async function predictTraits(formData) {
  const res = await fetch(`${ML_URL}/ml/predict_all`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function saveTraitHistory(username, traits) {
  const res = await fetch(`${API_URL}/api/predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, traits }),
  });
  return res.json();
}

export async function predictDisease(formData) {
  const res = await fetch(`${ML_URL}/hf/predict`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function saveDiseaseHistory(payload) {
  const res = await fetch(`${API_URL}/api/disease`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchTraitHistory(username) {
  const res = await fetch(`${API_URL}/api/predictions/${username}`);
  return res.json();
}

export async function fetchDiseaseHistory(username) {
  const res = await fetch(`${API_URL}/api/disease/${username}`);
  return res.json();
}

export async function updateDiseaseComment(username, index, comment) {
  const res = await fetch(`${API_URL}/api/disease/${username}/${index}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  return res.json();
}
