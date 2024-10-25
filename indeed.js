const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const dayjs = require('dayjs');

const crawData = async (payload) => {
  try {
   console.log(payload)
    // const keySearch = typeof payload?.keySearch === 'string' ? payload.keySearch : '';
    // console.log(keySearch)
    // const encodedString = encodeURIComponent(keySearch).replace(/%20/g, '+');

    // const browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();

    // await page.goto('https://jobs.vn.indeed.com/');
    // if (keySearch) {  // Kiểm tra nếu keySearch không rỗng
    //     await page.type('#text-input-what', keySearch);  // Đảm bảo `keySearch` là chuỗi
    //   } else {
    //     console.error('Lỗi: keySearch không hợp lệ.');
    //   }

    // await page.click('button.yosegi-InlineWhatWhere-primaryButton');
    // await page.waitForNavigation();
    // await page.goto(`https://jobs.vn.indeed.com/jobs?q=${encodedString}`);

    // const listLink = await page.evaluate(() => {
    //   const links = document.querySelectorAll('a.jcs-JobTitle.css-1baag51.eu4oa1w0');
    //   return Array.from(links).map(link => link.href);
    // });

    // console.log(listLink); // In ra danh sách các link tìm được
    // await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    const data = files.filter(name => name !== '1BE.json' && name !== 'createFIle.js' && name !== 'indeed.js');  
    console.log(data,'data')
  } catch (err) {
    throw err; 
  }
};

getListFileName()
//   .then(async (keySearch) => {
//     console.log(keySearch,'keySearch');
//     for (let i=0;i< keySearch.fileName ; i++) {
//       const payload = { keySearch: keySearch[i].trim() }; // Đảm bảo payload là chuỗi
//       await crawData(payload);
 
//     }
//   }) 
//   .catch(err => console.error(err));
