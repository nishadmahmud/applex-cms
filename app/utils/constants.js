import axios from "axios";

export const fetcher = (url) => axios.get(url).then(res => res.json());
export const fetcherWithToken = async (url, token) => {
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
