export const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado: se requiere rol admin" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};