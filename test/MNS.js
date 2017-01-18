/**
 * Created by liuxing on 16/7/4.
 */

var AliMNS = require("ali-mns");
var account = new AliMNS.Account("1691319996007796", "x", "x");
module.exports = {
  lx: new AliMNS.MQ("lx-test", account, "shenzhen"),
  elastic: new AliMNS.MQ("wan-admin-elastic-search", account, "shenzhen"),
}