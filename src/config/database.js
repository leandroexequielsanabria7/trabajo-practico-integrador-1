import "dotenv/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    define: {
      underscored: true, 
      timestamps: true,
    },
  }
);

export const startDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida");

    await sequelize.sync();
    console.log("Modelos sincronizados con la base de datos");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error.message);
    process.exit(1);
  }
};