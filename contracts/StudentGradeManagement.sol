// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentGradeManagement {
    address public trainingDepartment;

    // Cấu trúc yêu cầu mở lớp học phần
    struct CourseRequest {
        address lecturerAddress;
        string lecturerName;
        string courseName;
        bool isApproved; // Trạng thái: true = duyệt, false = chưa duyệt/chưa xử lý
    }

    // Cấu trúc thông tin sinh viên (không chứa mapping)
    struct StudentGrade {
        string studentId;
        string studentName;
    }

    // Danh sách giảng viên
    struct Lecturer {
        string lecturerName;
        bool isAuthorized;
    }

    // Lưu trữ yêu cầu và dữ liệu
    CourseRequest[] public courseRequests; // Danh sách yêu cầu từ giảng viên
    mapping(address => StudentGrade) public students; // Thông tin sinh viên
    mapping(address => mapping(string => uint)) public grades; // Điểm sinh viên: address -> courseName -> grade
    mapping(string => address[]) public courseStudents; // Học phần -> Danh sách sinh viên
    mapping(string => address) public studentIdToAddress; // Mã SV -> Địa chỉ
    mapping(address => Lecturer) public lecturers; // Thông tin giảng viên

    // Sự kiện
    event CourseRequested(uint requestId, address lecturerAddress, string lecturerName, string courseName);
    event CourseApproved(uint requestId, bool isApproved);
    event StudentAddedToCourse(string studentId, string courseName, address lecturerAddress);
    event GradeAdded(string studentId, string courseName, uint grade);
    event StudentRegistered(address studentAddress, string studentId, string studentName); // Thêm sự kiện này

    modifier onlyTrainingDepartment() {
        require(msg.sender == trainingDepartment, "Chi phong dao tao moi co quyen thuc hien.");
        _;
    }

    modifier onlyAuthorizedLecturer() {
        require(lecturers[msg.sender].isAuthorized, "Chi giang vien duoc uy quyen moi co quyen thuc hien.");
        _;
    }

    constructor() {
        trainingDepartment = msg.sender;
    }

    // --- Phòng Đào Tạo ---

    // Đăng ký sinh viên
    function registerStudent(address studentAddress, string memory studentId, string memory studentName) public onlyTrainingDepartment {
        students[studentAddress].studentId = studentId;
        students[studentAddress].studentName = studentName;
        studentIdToAddress[studentId] = studentAddress;
        emit StudentRegistered(studentAddress, studentId, studentName);
    }

    // Duyệt hoặc từ chối yêu cầu mở lớp
    function approveCourseRequest(uint requestId, bool isApproved) public onlyTrainingDepartment {
        require(requestId < courseRequests.length, "Yeu cau khong ton tai.");
        CourseRequest storage request = courseRequests[requestId];
        request.isApproved = isApproved;

        // Nếu duyệt, thêm giảng viên vào danh sách được ủy quyền
        if (isApproved) {
            lecturers[request.lecturerAddress].isAuthorized = true;
            lecturers[request.lecturerAddress].lecturerName = request.lecturerName;
        }

        emit CourseApproved(requestId, isApproved);
    }

    // --- Giảng Viên ---

    // Gửi yêu cầu mở lớp học phần
    function requestCourse(string memory lecturerName, string memory courseName) public {
        uint requestId = courseRequests.length;
        courseRequests.push(CourseRequest(msg.sender, lecturerName, courseName, false));
        emit CourseRequested(requestId, msg.sender, lecturerName, courseName);
    }

    // Thêm sinh viên vào lớp học phần
    function addStudentToCourse(string memory studentId, string memory courseName) public onlyAuthorizedLecturer {
        address studentAddress = studentIdToAddress[studentId];
        require(studentAddress != address(0), "Sinh vien khong ton tai.");

        bool isCourseApproved = false;
        for (uint i = 0; i < courseRequests.length; i++) {
            if (
                courseRequests[i].lecturerAddress == msg.sender &&
                keccak256(abi.encodePacked(courseRequests[i].courseName)) == keccak256(abi.encodePacked(courseName)) &&
                courseRequests[i].isApproved
            ) {
                isCourseApproved = true;
                break;
            }
        }
        require(isCourseApproved, "Hoc phan chua duoc duyet.");

        bool studentExists = false;
        for (uint i = 0; i < courseStudents[courseName].length; i++) {
            if (courseStudents[courseName][i] == studentAddress) {
                studentExists = true;
                break;
            }
        }
        if (!studentExists) {
            courseStudents[courseName].push(studentAddress);
            emit StudentAddedToCourse(studentId, courseName, msg.sender);
        }
    }
    // Nhập điểm cho sinh viên
    function addGrade(string memory studentId, string memory courseName, uint grade) public onlyAuthorizedLecturer {
        address studentAddress = studentIdToAddress[studentId];
        require(studentAddress != address(0), "Sinh vien khong ton tai.");

        // Kiểm tra giảng viên có quyền với học phần
        bool isCourseApproved = false;
        for (uint i = 0; i < courseRequests.length; i++) {
            if (
                courseRequests[i].lecturerAddress == msg.sender &&
                keccak256(abi.encodePacked(courseRequests[i].courseName)) == keccak256(abi.encodePacked(courseName)) &&
                courseRequests[i].isApproved
            ) {
                isCourseApproved = true;
                break;
            }
        }
        require(isCourseApproved, "Hoc phan chua duoc duyet.");

        grades[studentAddress][courseName] = grade; // Sử dụng mapping grades riêng
        emit GradeAdded(studentId, courseName, grade);
    }

    // --- Sinh Viên ---

    // Tra cứu điểm
    function getGrade(string memory courseName) public view returns (uint) {
        return grades[msg.sender][courseName]; // Sử dụng mapping grades riêng
    }

    // --- Hàm hỗ trợ ---

    // Lấy danh sách yêu cầu mở lớp (cho cả Phòng Đào Tạo và Giảng Viên)
    function getCourseRequests() public view returns (address[] memory, string[] memory, string[] memory, bool[] memory) {
        address[] memory lecturerAddresses = new address[](courseRequests.length);
        string[] memory lecturerNames = new string[](courseRequests.length);
        string[] memory courseNames = new string[](courseRequests.length);
        bool[] memory statuses = new bool[](courseRequests.length);

        for (uint i = 0; i < courseRequests.length; i++) {
            lecturerAddresses[i] = courseRequests[i].lecturerAddress;
            lecturerNames[i] = courseRequests[i].lecturerName;
            courseNames[i] = courseRequests[i].courseName;
            statuses[i] = courseRequests[i].isApproved;
        }
        return (lecturerAddresses, lecturerNames, courseNames, statuses);
    }

    // Lấy danh sách sinh viên theo học phần (cho Giảng Viên)
    function getStudentsByCourse(string memory courseName) public view onlyAuthorizedLecturer returns (address[] memory, string[] memory, string[] memory, uint[] memory) {
        address[] memory addresses = courseStudents[courseName];
        string[] memory studentIds = new string[](addresses.length);
        string[] memory studentNames = new string[](addresses.length);
        uint[] memory studentGrades = new uint[](addresses.length);

        for (uint i = 0; i < addresses.length; i++) {
            studentIds[i] = students[addresses[i]].studentId;
            studentNames[i] = students[addresses[i]].studentName;
            studentGrades[i] = grades[addresses[i]][courseName];
        }
        return (addresses, studentIds, studentNames, studentGrades);
    }

    // Lấy danh sách sinh viên theo học phần (cho Sinh Viên)
    function getCourseStudentsPublic(string memory courseName) public view returns (address[] memory, string[] memory, string[] memory, uint[] memory) {
        address[] memory addresses = courseStudents[courseName];
        string[] memory studentIds = new string[](addresses.length);
        string[] memory studentNames = new string[](addresses.length);
        uint[] memory studentGrades = new uint[](addresses.length);

        for (uint i = 0; i < addresses.length; i++) {
            studentIds[i] = students[addresses[i]].studentId;
            studentNames[i] = students[addresses[i]].studentName;
            studentGrades[i] = grades[addresses[i]][courseName]; // Sử dụng mapping grades riêng
        }
        return (addresses, studentIds, studentNames, studentGrades);
    }
}