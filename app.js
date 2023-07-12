const express = require('express');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes=require('./routes/groupRoutes')
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./util/db');
const Users = require('./models/user');
const Messages = require('./models/message');
const Group = require('./models/group');
const GroupMember = require('./models/groupMember');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(userRoutes);
app.use(messageRoutes);
app.use(groupRoutes)


Users.hasMany(Messages, { foreignKey: 'user_id' });
Messages.belongsTo(Users, { foreignKey: 'user_id' });
Group.belongsTo(Users, { foreignKey: 'created_by' });
GroupMember.belongsTo(Users, { foreignKey: 'user_id' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });
Group.hasMany(GroupMember, { foreignKey: 'group_id' });

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.log(err);
    });
