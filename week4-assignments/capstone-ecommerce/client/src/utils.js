export const formatPrice = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");
export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
