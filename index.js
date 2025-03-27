const Web3 = require('web3');

// Kết nối với Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Địa chỉ hợp đồng (lấy từ kết quả truffle migrate)
const contractAddress = "0xe8Ad8f11EAB331369B35573f11f59C859F1403dE"; // Thay bằng địa chỉ thực tế

// ABI của hợp đồng (lấy từ build/contracts/StudentGradeManagement.json)
const contractABI = require('./build/contracts/StudentGradeManagement.json').abi;

// Khởi tạo hợp đồng
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Tài khoản (lấy từ Ganache)
const trainingDeptAccount = "0xeB100E1a3823526bFF5a37ba53fb8E3DFB47dF55"; // Thay bằng tài khoản đầu tiên từ Ganache
const lecturerAccount = "0xCdF0500fE23B63fe233455664Ef8fc947e3274ed";     // Tài khoản thứ 2
const studentAccount = "0x25F2B62f3EBbd58426325B63a63ae63f5a9B3Cd4";       // Tài khoản thứ 3

// Hàm đăng ký sinh viên
async function registerStudent() {
  await contract.methods.registerStudent(
    studentAccount,
    "SV001",
    "Nguyen Van A",
    "CNTT2023"
  ).send({ from: trainingDeptAccount, gas: 3000000 });
  console.log("Student registered!");
}

// Hàm ủy quyền giảng viên
async function authorizeLecturer() {
  await contract.methods.authorizeLecturer(
    lecturerAccount,
    "GV001"
  ).send({ from: trainingDeptAccount, gas: 3000000 });
  console.log("Lecturer authorized!");
}

// Hàm nhập điểm
async function addGrade() {
  await contract.methods.addGrade(
    "SV001",
    "Math",
    85
  ).send({ from: lecturerAccount, gas: 3000000 });
  console.log("Grade added!");
}

// Hàm xem điểm
async function getGrade() {
  const grade = await contract.methods.getGrade("Math").call({ from: studentAccount });
  console.log("Student's grade:", grade);
}

// Thực thi các hàm
async function run() {
  await registerStudent();
  await authorizeLecturer();
  await addGrade();
  await getGrade();
}

run().catch(console.error);