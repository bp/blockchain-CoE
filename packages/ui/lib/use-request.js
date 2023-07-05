import { useState } from 'react';
import axios from 'axios';

export default function Main() {
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const doRequest = async ({ url, method, body }) => {
    try {
      setErrors(null);
      setLoading(true);
      const res = await axios({
        url,
        method,
        data: body,
        withCredentials: true
      });
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return { doRequest, errors, loading };
}
