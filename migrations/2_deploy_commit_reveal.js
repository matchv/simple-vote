var CommitReveal = artifacts.require("CommitReveal.sol");

module.exports = function (deployer) {
  deployer.deploy(CommitReveal, 60 * 3, "YES", "NO");
};