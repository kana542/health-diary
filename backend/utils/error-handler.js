export const errorHandler = (err, req, res, next) => {
   console.error('Error:', err.message);

   if (err.name === 'ValidationError') {
     return res.status(400).json({ message: err.message });
   }

   if (err.name === 'UnauthorizedError') {
     return res.status(401).json({ message: 'Invalid token' });
   }

   res.status(500).json({ message: 'Internal server error' });
 };
