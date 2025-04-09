'use strict';
module.exports = (sequelize, DataTypes) => {
    const Handbook = sequelize.define('Handbook', {
        title: DataTypes.STRING,
        contentMarkdown: DataTypes.TEXT,
        contentHTML: DataTypes.TEXT,
        forDoctorId: DataTypes.INTEGER,
        forSpecializationId: DataTypes.INTEGER,
        forClinicId: DataTypes.INTEGER,
        writerId: DataTypes.INTEGER,
        confirmByDoctor: DataTypes.STRING,
        image: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        deletedAt: DataTypes.DATE
    }, {});
    Handbook.associate = function (models) {
        models.Post.belongsTo(models.User, { foreignKey: 'forDoctorId' });
        models.Post.belongsTo(models.Specialization, { foreignKey: 'forSpecializationId' });
        models.Post.belongsTo(models.Clinic, { foreignKey: 'forClinicId' });
    };
    return Handbook;
};