import { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance.js'; // Adjust the path as needed

const useMonthlyReports = (token) => {
    
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosInstance.get('/monthly/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data.results || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  return { reports, loading, error };
};

export default useMonthlyReports;