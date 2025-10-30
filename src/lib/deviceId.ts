// src/lib/deviceId.ts
export function getDeviceId() {
  const key = 'device_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
