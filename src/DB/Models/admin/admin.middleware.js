import { roletype, usermodel } from "../user.model.js";
import * as dbservice from "../../../DB/dbservice.js";

export const changeRole = async (req, res, next) => {
  const allRoles = Object.values(roletype);
  console.log(allRoles);

  // user login
  const userReq = req.user;

  // target user
  const targetUser = await dbservice.findById({
    model: usermodel,
    id: req.body.userId,
  });

  const userReqRole = userReq.role; // admin
  const targetUserRole = targetUser.role; // user

  const userReqIndex = allRoles.indexOf(userReqRole);
  const targetUserIndex = allRoles.indexOf(targetUserRole);

  const canModify = userReqIndex < targetUserIndex;

  if (!canModify) return next(new Error("unauthorized", { cause: 401 }));

  return next();
};
