const fs = require('fs');

const arr = require('./10D.json')

    function createJsonFiles(array) {
        array.forEach(item => {
          const fileName = `${item}.json`; // Tên tệp tương ứng
          const data = []; // Dữ liệu mẫu
      
          // Ghi dữ liệu vào tệp JSON
          fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
            if (err) {
              console.error(`Lỗi khi tạo tệp ${fileName}:`, err);
            } else {
              console.log(`Đã tạo tệp: ${fileName}`);
            }
          });
        });
      }
      
      createJsonFiles(arr);