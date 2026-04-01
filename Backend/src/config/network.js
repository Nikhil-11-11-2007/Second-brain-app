import dns from "node:dns/promises";

export const setupDNS = () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
};