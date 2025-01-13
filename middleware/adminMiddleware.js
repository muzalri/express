const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
  };
  
  module.exports = { isAdmin };