const isAdmin = async (req, res, next) => {
  console.log('User data:', req.user);
  console.log('User role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
      currentRole: req.user?.role || 'tidak ada role',
      userData: req.user
    });
  }
};

module.exports = { isAdmin };