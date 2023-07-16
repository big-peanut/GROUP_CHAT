const express = require('express');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./util/db');
const Users = require('./models/user');
const Messages = require('./models/message');
const Group = require('./models/group');
const GroupMember = require('./models/groupMember');
const socketio = require('socket.io');

const app = express();
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = socketio(server);

app.use(bodyParser.json());
app.use(
  cors({
    origin:'http://127.0.0.1:5500'
  }));

app.use(userRoutes);
app.use(messageRoutes);
app.use(groupRoutes);

Users.hasMany(Messages, { foreignKey: 'user_id' });
Messages.belongsTo(Users, { foreignKey: 'user_id' });
Group.belongsTo(Users, { foreignKey: 'created_by' });
GroupMember.belongsTo(Users, { foreignKey: 'user_id' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });
Group.hasMany(GroupMember, { foreignKey: 'group_id' });

sequelize
  .sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.log(err);
  });

io.on('connection', (socket) => {
  console.log('------------------A user connected-------------------');
  socket.on('message',(msg)=>{
    if(msg.groupId){
      socket.to(msg.groupId).emit('message', msg);
    }
    else{
      socket.broadcast.emit('message',msg)
    }
    
  })
});
