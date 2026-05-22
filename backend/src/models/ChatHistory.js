module.exports = (sequelize, DataTypes) => {
    const ChatHistory = sequelize.define('ChatHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID của người dùng, để null nếu là khách vãng lai',
            references: {
                model: 'users', // ĐÃ SỬA: Phải khớp với tên bảng thực tế 'users' trong ảnh workbench của bạn
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        role: {
            type: DataTypes.ENUM('user', 'model'),
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: [['user', 'model']]
            }
        },
        message: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        tableName: 'ChatHistories', // Đảm bảo trùng khớp 100% với tên bảng bạn vừa chạy lệnh SQL
        timestamps: true,
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
    });

    ChatHistory.associate = (models) => {
        // KIỂM TRA: Trong thư mục models của bạn, file quản lý người dùng tên là gì?
        // Nếu file đó là userModel.js, có thể Sequelize đặt tên model là 'userModel' hoặc 'User'
        // Bạn hãy kiểm tra trong models/index.js hoặc file user tương ứng.
        const UserModel = models.users || models.User || models.userModel;

        if (UserModel) {
            ChatHistory.belongsTo(UserModel, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    };

    return ChatHistory;
};