import Statistics from "../../lib/Statistics";

export default function catchAll(req, res) {
  Statistics.log();
  res.status(404).json({message: "This API does not exist"});
}