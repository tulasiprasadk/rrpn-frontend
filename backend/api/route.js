import adminHandler from "./admin/[...path].js";
import cmsHandler from "./cms/[...path].js";
import orderHandler from "./_lib/orderRoute.js";

export default function handler(req, res) {
  if (req.query?.handler === "cms") {
    return cmsHandler(req, res);
  }
  if (req.query?.handler === "orders") {
    return orderHandler(req, res);
  }
  return adminHandler(req, res);
}
