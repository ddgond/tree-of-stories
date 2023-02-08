import Statistics from "../../lib/Statistics";

export default function stats(req, res) {
  res.status(200).send(Statistics.toString());
}