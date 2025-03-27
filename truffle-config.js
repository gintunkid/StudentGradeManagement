module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Địa chỉ Ganache
      port: 7545,        // Cổng mặc định của Ganache
      network_id: "*"    // Kết nối với bất kỳ network nào
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Phiên bản Solidity
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};