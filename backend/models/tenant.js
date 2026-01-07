'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tenant.hasMany(models.User, {
        foreignKey: 'tenantId',
        as: 'users',
      });
      Tenant.hasMany(models.Project, {
        foreignKey: 'tenantId',
        as: 'projects',
      });
    }
  }
  Tenant.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending_approval'),
      defaultValue: 'active'
    },
    subscription_plan: {
      type: DataTypes.ENUM('free', 'pro', 'enterprise'),
      defaultValue: 'free'
    },
    requested_plan: {
      type: DataTypes.ENUM('pro', 'enterprise'),
      allowNull: true
    },
    max_users: {
      type: DataTypes.INTEGER,
      defaultValue: 5 // Default for free plan
    },
    max_projects: {
      type: DataTypes.INTEGER,
      defaultValue: 3 // Default for free plan
    }
  }, {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    underscored: true,
  });
  return Tenant;
};
