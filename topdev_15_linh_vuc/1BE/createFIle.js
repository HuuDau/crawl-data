


const arr = require('./1BE.json')

const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const dayjs = require('dayjs');

// mb-4 last:mb-0
const crawData = async () => {
  try {
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    let n=0;
    await page.goto('https://topdev.vn/viec-lam-it/java-kt21');
    // const button = await page.$('.inline-flex.items-center.justify-center.gap-1.border.border-solid.text-sm.transition-all.disabled\\:cursor-not-allowed.lg\\:gap-3.lg\\:text-base.border-primary.bg-transparent.text-primary.hover\\:bg-primary-100.dark\\:border-white.dark\\:text-white.undefined.h-9.rounded.px-4.font-semibold.lg\\:h-12.lg\\:px-6.w-full');
 
    // while(n<2){
    //   await button.click();
    //   await new Promise(resolve => setTimeout(resolve, 3000));
    //   n++
    // }

    const content = await page.content()

    fss.writeFileSync(`content.html`, JSON.stringify(content, null, 2));
      console.log(`Dữ liệu đã được lưu vào content.html`);

    await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
crawData()

const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    return files.filter(name => name !== '1BE.json' && name !== 'createFIle.js' ); 
  } catch (err) {
    throw err; 
  }
}


function convertToSlug(str) {
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[^a-zA-Z0-9\s]/g, '-');  
  str = str.trim().replace(/\s+/g, '-'); 
  str = str.replace(/-+/g, '-'); 
  return str.toLowerCase(); 
}

// getListFileName()
//   .then(async (data) => {
//    const payloadArr = data.map((name)=>{
//     const formatName = convertToSlug(name.slice(0,name.length-5))
//       return {
//         fileName:name,
//         link:`https://itviec.com/viec-lam-it/${convertToSlug(formatName)}?`
//       }
//     })

//     for (const payload of payloadArr) {
//        await crawData(payload)
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     }
//   }) 
//   .catch(err => console.error(err));
      
  

    // function createJsonFiles(array) {
    //     array.forEach(item => {
    //       const fileName = `${item}.json`;
    //       const data = [];
      
   
    //       fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
    //         if (err) {
    //           console.error(`Lỗi khi tạo tệp ${fileName}:`, err);
    //         } else {
    //           console.log(`Đã tạo tệp: ${fileName}`);
    //         }
    //       });
    //     });
    //   }
      
    //   createJsonFiles(arr);

    // function createJsonFiles(array) {
    //     array.forEach(item => {
    //       const fileName = `${item}.json`; // Tên tệp tương ứng
    //       const data = []; // Dữ liệu mẫu
      
    //       // Ghi dữ liệu vào tệp JSON
    //       fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
    //         if (err) {
    //           console.error(`Lỗi khi tạo tệp ${fileName}:`, err);
    //         } else {
    //           console.log(`Đã tạo tệp: ${fileName}`);
    //         }
    //       });
    //     });
    //   }
      
    //   createJsonFiles(arr);