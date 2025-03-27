import React, { useState, useEffect } from 'react';
import web3 from './web3';
import contractJson from './StudentGradeManagement.json';

const contractAddress = '0x53185CA18eC37f442760a52154EB3AA89227735A'; // Địa chỉ hợp đồng
const contract = new web3.eth.Contract(contractJson.abi, contractAddress);

function Student() {
  const [account, setAccount] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[2]);
    };
    loadAccount();
  }, []);

  const getGrade = async () => {
    const result = await contract.methods.getGrade(courseName).call({ from: account });
    setGrade(result);
    await getCourseStudents();
  };

  const getCourseStudents = async () => {
    const result = await contract.methods.getCourseStudentsPublic(courseName).call({ from: account });
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
      <h2 style={styles.header}>Sinh Viên</h2>
      <p style={styles.account}>Tài Khoản: <span style={styles.accountAddress}>{account}</span></p>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Tra Cứu Điểm</h3>
        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            placeholder="Tên Học Phần"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <button style={styles.button} onClick={getGrade}>
            Tra Cứu
          </button>
        </div>
        {grade !== null && (
          <p style={styles.gradeText}>
            Điểm của bạn: <span style={styles.gradeValue}>{grade}</span>
          </p>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.subHeader}>Danh Sách Sinh Viên Trong Học Phần</h3>
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
  gradeText: {
    fontSize: '16px',
    color: '#333',
    marginTop: '15px',
  },
  gradeValue: {
    fontWeight: 'bold',
    color: '#28a745',
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
styles.button[':hover'] = { backgroundColor: '#218838' };
styles.tableRow[':hover'] = { backgroundColor: '#f5f5f5' };

export default Student;