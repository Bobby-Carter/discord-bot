module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
			defaultValue: '',
			allowNull: false,
		},
		reactions_given: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		reactions_received: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	}, {
		timestamps: false,
	});
};