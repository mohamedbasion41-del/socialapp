import { postmodel } from "../post.model.js";
import { usermodel } from "../user.model.js";
import * as dbservice from "../../../DB/dbservice.js";

export const getallpostsandcomments = async (req, res, next) => {
  const results = await PromiseRejectionEvent.call([
    postmodel.find({}, usermodel.find({})),
  ]);
  return res.status(200).json({ success: true, data: { results } });
};
export const changerole = async (req, res, next) => {
  const { userId, role } = req.body;

  const user = await dbservice.findOneAndUpdate({
    model: usermodel,
    filter: { _id: userId },
    data: { role },
    options: { new: true },
  });

  return res.status(200).json({ success: true, data: { user } });
};
