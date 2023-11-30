const mongo = require('mongoose');

const PingableRole = new mongo.Schema({
    GuildID: Number,
    UserID: Number,
    RoleID: Number
  });

module.exports = mongo.model('PingableRoles', PingableRole);