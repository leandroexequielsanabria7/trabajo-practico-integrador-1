import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'tags',
});