import {requestToString} from "../../lib/utilities";
import Logger from "../../lib/Logger";
import Statistics from "../../lib/Statistics";

export default function catchAll(req, res) {
  Statistics.nonexistentApiRequests.increment();
  Logger.log(requestToString(req), 'Strange URL');
  res.status(404).json({message: "This API does not exist"});
}