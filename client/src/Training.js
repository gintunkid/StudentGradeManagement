import React, { useState, useEffect } from 'react';
import web3 from './web3';
import contractJson from './StudentGradeManagement.json';

const contractAddress = '0x53185CA18eC37f442760a52154EB3AA89227735A'; // Địa chỉ hợp đồng
const contract = new web3.eth.Contract(contractJson.abi, contractAddress);

function Training() {
  const [account, setAccount] = useState('');
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [studentAddress, setStudentAddress] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      fetchRequests();
    };
    loadData();
  }, []);

  const fetchRequests = async () => {
    const result = await contract.methods.getCourseRequests().call();
    const allRequests = result[0].map((addr, i) => ({
      id: i,
      lecturerAddress: addr,
      lecturerName: result[1][i],
      courseName: result[2][i],
      isApproved: result[3][i],
    }));
    setRequests(allRequests.filter(req => !req.isApproved));
    setHistory(allRequests.filter(req => req.isApproved));
  };

  const approveRequest = async (requestId, isApproved) => {
    await contract.methods.approveCourseRequest(requestId, isApproved).send({ from: account, gas: 3000000 });
    fetchRequests();
  };

  const registerStudent = async () => {
    await contract.methods.registerStudent(studentAddress, studentId, studentName).send({ from: account, gas: 3000000 });
    alert('Sinh viên đã được đăng ký!');
    setStudentAddress('');
    setStudentId('');
    setStudentName('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Phòng Đào Tạo</h2>
      <p style={styles.account}>Tài Khoản: <span style={styles.accountAddress}>{account}</span></p>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Đăng Ký Sinh Viên</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Địa Chỉ Sinh Viên"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Mã Sinh Viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Tên Sinh Viên"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <button style={styles.button} onClick={registerStudent}>
            Đăng Ký
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Danh Sách Yêu Cầu Duyệt Lớp Học Phần</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Địa Chỉ Giảng Viên</th>
              <th style={styles.th}>Tên Giảng Viên</th>
              <th style={styles.th}>Tên Học Phần</th>
              <th style={styles.th}>Trạng Thái</th>
              <th style={styles.th}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={styles.tableRow}>
                <td style={styles.td}>{req.lecturerAddress}</td>
                <td style={styles.td}>{req.lecturerName}</td>
                <td style={styles.td}>{req.courseName}</td>
                <td style={styles.td}>Chưa duyệt</td>
                <td style={styles.td}>
                  <button style={styles.actionButtonApprove} onClick={() => approveRequest(req.id, true)}>
                    Duyệt
                  </button>
                  <button style={styles.actionButtonReject} onClick={() => approveRequest(req.id, false)}>
                    Từ Chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Lịch Sử Duyệt</h3>
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
            {history.map((req) => (
              <tr key={req.id} style={styles.tableRow}>
                <td style={styles.td}>{req.lecturerAddress}</td>
                <td style={styles.td}>{req.lecturerName}</td>
                <td style={styles.td}>{req.courseName}</td>
                <td style={styles.td}>Đã duyệt</td>
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
  actionButtonApprove: {
    padding: '8px 15px',
    marginRight: '5px',
    fontSize: '14px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  actionButtonReject: {
    padding: '8px 15px',
    fontSize: '14px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

// Hover effects
styles.input[':hover'] = { borderColor: '#007bff' };
styles.button[':hover'] = { backgroundColor: '#218838' };
styles.tableRow[':hover'] = { backgroundColor: '#f5f5f5' };
styles.actionButtonApprove[':hover'] = { backgroundColor: '#218838' };
styles.actionButtonReject[':hover'] = { backgroundColor: '#c82333' };

export default Training;