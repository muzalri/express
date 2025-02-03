const isAdmin = async (req, res, next) => {
  console.log('User role:', req.user?.role); // Debug log
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
      currentRole: req.user?.role || 'tidak ada role'
    });
  }
};

module.exports = { isAdmin };