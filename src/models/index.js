import { sequelize, connectDB } from '../config/database.js';
import { User } from './User.js';
import { Profile } from './Profile.js';

User.hasOne(Profile, {
  foreignKey: 'user_id',
  as: 'profile',
  onDelete: 'CASCADE',
});

Profile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export { sequelize, connectDB, User, Profile };