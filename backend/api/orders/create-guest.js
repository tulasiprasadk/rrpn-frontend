import { handleCreatePageOrder } from "../_lib/pageOrderHandler.js";

export default async function handler(req, res) {
  return handleCreatePageOrder(req, res, true);
}
