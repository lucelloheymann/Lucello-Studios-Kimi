// Temporärer Demo-Auth-Bypass
export const auth = () => Promise.resolve({
  user: { id: "demo-user", email: "demo@lucello.de", name: "Demo User" }
});
export { auth as default };
