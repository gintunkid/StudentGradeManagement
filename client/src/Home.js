import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import web3 from './web3';

function Home() {
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    loadAccount();
  }, []);

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
    if (selectedRole) {
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Hệ Thống Quản Lý Điểm Sinh Viên</h1>
      <p style={styles.account}>
        Tài Khoản Kết Nối: <span style={styles.accountAddress}>{account}</span>
      </p>
      <div style={styles.selectionGroup}>
        <label style={styles.label}>Chọn Đối Tượng: </label>
        <select style={styles.select} value={role} onChange={handleRoleChange}>
          <option value="">-- Chọn vai trò --</option>
          <option value="training">Phòng Đào Tạo</option>
          <option value="lecturer">Giảng Viên</option>
          <option value="student">Sinh Viên</option>
        </select>
      </div>
    </div>
  );
}

// Định nghĩa styles
const styles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  account: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '30px',
  },
  accountAddress: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  selectionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  label: {
    fontSize: '18px',
    color: '#444',
  },
  select: {
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '250px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
};

// Hover effects
styles.select[':hover'] = {
  borderColor: '#007bff',
  boxShadow: '0 0 5px rgba(0, 123, 255, 0.3)',
};

export default Home;