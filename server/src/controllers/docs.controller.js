import { apiDocumentation } from '../utils/apiDocs.js';

export const getDocs = (req, res) => {
  res.status(200).json(apiDocumentation);
}; 