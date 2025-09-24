// export default {
//   //   apiServer: "http://localhost:3001",
//   //   apiServer: "/api",
//   token: "token_nuxt_erp",
// };

export default {
  apiServer: process.env.NUXT_PUBLIC_API_SERVER || "http://localhost:3001",
  token: "token_nuxt_erp",
};
