module.exports = (sequelize, DataTypes) => {
	return sequelize.define('messages', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		text: {
			type: DataTypes.STRING,
			defaultValue: '',
			allowNull: false,
		},
		author: {
			type: DataTypes.STRING,
			defaultValue: '',
		},
		link: {
			type: DataTypes.STRING,
			defaultValue: '',
		},
		reactionsCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	}, {
		timestamps: false,
	});
};