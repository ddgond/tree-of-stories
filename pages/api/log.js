import Statistics from "../../lib/Statistics";

export default function catchAll(req, res) {
  Statistics.log();
  res.status(200).send(Statistics.toString());
}