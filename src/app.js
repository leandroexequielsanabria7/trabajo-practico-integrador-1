import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './models/index.js';
import articleRoutes from './routes/articleRoutes.js';
import articleTagRoutes from './routes/articleTagRoutes.js';
import authRoutes from './routes/authRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ message: 'API de Blog Personal funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/articles-tags', articleTagRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El JSON enviado no es válido' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'El cuerpo de la solicitud es demasiado grande' });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'El recurso ya existe' });
  }

  if (
    error.name === 'SequelizeForeignKeyConstraintError'
    || error.name === 'SequelizeValidationError'
  ) {
    return res.status(400).json({ message: 'Los datos enviados no son válidos' });
  }

  if (error.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ message: error.message });
  }

  console.error('Error inesperado en la API:', error);
  return res.status(500).json({ message: 'Error interno del servidor' });
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('La variable JWT_SECRET debe configurarse antes de iniciar el servidor');
    }

    await connectDB();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
  }
};

startServer();