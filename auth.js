import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ensureAuthorization = (req, res) => {
  try {
    let receivedJwt = req.headers.authorization;
    let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
    return decodedJwt;
  } catch (err) {
    return err;
  }
};

export default ensureAuthorization;
