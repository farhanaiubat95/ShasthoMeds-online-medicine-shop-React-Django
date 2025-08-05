import React from 'react';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';

const ErrorPage = () => {
  return (
    <div className=" bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
      <div className="my-30 bg-white p-10 rounded-lg shadow-lg text-center max-w-md w-full">
        <motion.h1
          className="text-[100px] font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          404
        </motion.h1>
        <h2 className="text-xl font-semibold text-gray-800 mt-4">OPPS! PAGE NOT FOUND</h2>
        <p className="text-gray-600 mt-2">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            variant="contained"
            sx={{ borderRadius: 50, paddingX: 3 }}
            onClick={() => window.location.href = '/'}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
