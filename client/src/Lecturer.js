import React, { useState, useEffect, useCallback } from 'react';
import web3 from './web3';
import contractJson from './StudentGradeManagement.json';

const contractAddress = '0x53185CA18eC37f442760a52154EB3AA89227735A'; // Địa chỉ hợp đồng
const contract = new web3.eth.Contract(contractJson.abi, contractAddress);

function Lecturer() {
  const [account, setAccount] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseStudents, setCourseStudents] = useState([]);

  const fetchRequests = useCallback(async () => {
    const result = await contract.methods.getCourseRequests().call();
    const allRequests = result[0].map((addr, i) => ({
      id: i,
      lecturerAddress: addr,
      lecturerName: result[1][i],
      courseName: result[2][i],
      isApproved: result[3][i],
    }));
    const myRequests = allRequests.filter(req => req.lecturerAddress === account);
    setRequests(myRequests.filter(req => !req.isApproved));
    setHistory(myRequests.filter(req => req.isApproved));
  }, [account]);

  useEffect(() => {
    const loadData = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[1]);
      await fetchRequests();
    };
    loadData();
  }, [fetchRequests]);

  const requestCourse = async () => {
    await contract.methods.requestCourse(lecturerName, courseName).send({ from: account, gas: 3000000 });
    fetchRequests();
  };

  const addStudentToCourse = async (course) => {
    await contract.methods.addStudentToCourse(studentId, course).send({ from: account, gas: 3000000 });
    alert(`Sinh viên ${studentId} đã được thêm vào lớp ${course}!`);
    setStudentId('');
  };

  const addGrade = async () => {
    await contract.methods.addGrade(studentId, courseName, parseInt(grade)).send({ from: account, gas: 3000000 });
    alert(`Đã thêm điểm ${grade} cho sinh viên ${studentId} trong học phần ${courseName}!`);
    setStudentId('');
    setCourseName('');
    setGrade('');
  };

  const getStudentsByCourse = async () => {
    const result = await contract.methods.getStudentsByCourse(selectedCourse).call({ from: account });
    const students = result[0].map((addr, i) => ({
      address: addr,
      studentId: result[1][i],
      studentName: result[2][i],
      grade: result[3][i],
    }));
    setCourseStudents(students);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Giảng Viên</h2>
      <p style={styles.account}>Tài Khoản: <span style={styles.accountAddress}>{account}</span></p>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Gửi Yêu Cầu Mở Lớp</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Tên Giảng Viên"
            value={lecturerName}
            onChange={(e) => setLecturerName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Tên Học Phần"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <button style={styles.button} onClick={requestCourse}>
            Gửi Yêu Cầu
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Danh Sách Yêu Cầu</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Địa Chỉ Giảng Viên</th>
              <th style={styles.th}>Tên Giảng Viên</th>
              <th style={styles.th}>Tên Học Phần</th>
              <th style={styles.th}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={styles.tableRow}>
                <td style={styles.td}>{req.lecturerAddress}</td>
                <td style={styles.td}>{req.lecturerName}</td>
                <td style={styles.td}>{req.courseName}</td>
                <td style={styles.td}>Chưa duyệt</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Lịch Sử Phê Duyệt</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Địa Chỉ Giảng Viên</th>
              <th style={styles.th}>Tên Giảng Viên</th>
              <th style={styles.th}>Tên Học Phần</th>
              <th style={styles.th}>Thêm Sinh Viên</th>
            </tr>
          </thead>
          <tbody>
            {history.map((req) => (
              <tr key={req.id} style={styles.tableRow}>
                <td style={styles.td}>{req.lecturerAddress}</td>
                <td style={styles.td}>{req.lecturerName}</td>
                <td style={styles.td}>{req.courseName}</td>
                <td style={styles.td}>
                  <div style={styles.inlineGroup}>
                    <input
                      style={styles.inputSmall}
                      placeholder="Mã Sinh Viên"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                    <button style={styles.actionButton} onClick={() => addStudentToCourse(req.courseName)}>
                      Thêm
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Nhập Điểm</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Mã Sinh Viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Tên Học Phần"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Điểm"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <button style={styles.button} onClick={addGrade}>
            Thêm Điểm
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Danh Sách Sinh Viên Theo Học Phần</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Tên Học Phần"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          />
          <button style={styles.button} onClick={getStudentsByCourse}>
            Hiển Thị
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Mã Sinh Viên</th>
              <th style={styles.th}>Tên Sinh Viên</th>
              <th style={styles.th}>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {courseStudents.map((student, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.td}>{student.studentId}</td>
                <td style={styles.td}>{student.studentName}</td>
                <td style={styles.td}>{student.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Định nghĩa styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '28px',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  account: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
  },
  accountAddress: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  section: {
    marginBottom: '40px',
  },
  subHeader: {
    fontSize: '22px',
    color: '#444',
    marginBottom: '15px',
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  inlineGroup: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    flex: '1',
    minWidth: '200px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  inputSmall: {
    padding: '8px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '120px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  actionButton: {
    padding: '8px 15px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '16px',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.3s',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333',
  },
};

// Hover effects
styles.input[':hover'] = { borderColor: '#007bff' };
styles.inputSmall[':hover'] = { borderColor: '#007bff' };
styles.button[':hover'] = { backgroundColor: '#218838' };
styles.actionButton[':hover'] = { backgroundColor: '#0056b3' };
styles.tableRow[':hover'] = { backgroundColor: '#f5f5f5' };

export default Lecturer;