const StudentGradeManagement = artifacts.require("StudentGradeManagement");

module.exports = function (deployer) {
  deployer.deploy(StudentGradeManagement);
};