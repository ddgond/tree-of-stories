import {requestToString} from "../../lib/utilities";
import Logger from "../../lib/Logger";

export default function catchAll(req, res) {
  Logger.log(requestToString(req), 'Strange URL');
  res.status(404).json({message: "This API does not exist"});
}