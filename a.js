var models = require("./models");
models.sequelize.sync().then(function () {
    var Player = models.sequelize.define('player', {name :models.Sequelize.STRING})
      , Team  = models.sequelize.define('team', {name :models.Sequelize.STRING});
    Player.belongsTo(Team);
    Player.sync({force: true}).then(function () {
    });
});
