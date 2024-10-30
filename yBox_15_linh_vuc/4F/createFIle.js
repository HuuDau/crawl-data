

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const fs = require('fs').promises;
const dayjs = require('dayjs');

const getData = async (payload) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(payload.link, { waitUntil: 'networkidle2', timeout: 60000 });
  
    let allLinks = [];
    let previousLinksLength = 0;
    let isScrolling = true;

    await new Promise(resolve => setTimeout(resolve, 5000));
    while (isScrolling) {
      const newLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.post-title a')).map(link => link.href);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      allLinks = Array.from(new Set([...allLinks, ...newLinks])); // Loại bỏ trùng lặp
     
      // Nếu không có thêm link mới, dừng cuộn
      if (allLinks.length === previousLinksLength) {
        isScrolling = false;
      } else {
        previousLinksLength = allLinks.length;
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)'); // Cuộn xuống cuối trang
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    let newArrList = [];
    if (allLinks.length > 7) {
      newArrList = allLinks.slice(0, allLinks.length - 7);
    }
    let results = [];

    const extractJobDetails = async (link) => {
      await page.goto(link);
      await new Promise(resolve => setTimeout(resolve, 3000));

      return await page.evaluate((link, today) => {
        const skillDev = () => {
          const elements = document.querySelectorAll('.text-title-post.text-primary');
          const texts = Array.from(elements).map(element => element?.innerText);
          return texts[0];
        };

        const description = () => {
          const div = document.querySelector('#post-content');
          if (div) {
            return Array.from(div.children).slice(0, 3).map(child => child?.innerText.replaceAll('\n', ''));
          } else {
            return [];
          }
        };

        const workplace = () => {
          const secondDesc = description()[1];
          const arr = secondDesc.split('Địa điểm:');
          const arrSalaty = arr[1].split('-  Chuyên môn:');
          return arrSalaty[0];
        };

        const money = () => {
          const secondDesc = description()[1];
          const arr = secondDesc.split('Mức lương:');
          const arrSalaty = arr[1].split('-  Địa điểm:');
          return arrSalaty[0];
        };

        return {
          title: document.querySelector('.text-semibold.mb-5.title')?.innerText,
          description: description(),
          linkJob: link,
          crawlTime: today,
          skills: skillDev(),
          salary_range: money(),
          workplace: workplace()
        };
      }, link, dayjs().format('DD/MM/YYYY'));
    };

    for (const link of newArrList) {
      const jobData = await extractJobDetails(link);
      results.push(jobData);
    }
    console.log(results, 'results');

    fss.writeFileSync(`${payload?.fileName}`, JSON.stringify(results, null, 2));
    console.log(`Dữ liệu đã được lưu vào ${payload?.fileName}`);

    await browser.close();
  } catch (error) {
    console.log('Đã có lỗi:', error);
  }
};


function convertToSlug(str) {
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[^a-zA-Z0-9\s]/g, '+');  
  str = str.trim().replace(/\s+/g, '+'); 
  return str.toLowerCase(); 
}

const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    return files.filter(name => name !== '4F.json' && name !== 'createFIle.js'  && name !== 'index.js' ); 
  } catch (err) {
    throw err; 
  }
}

getListFileName()
  .then(async (data) => {
   const payloadArr = data.map((name)=>{
    const formatName = convertToSlug(name.slice(0,name.length-5))
      return {
        fileName:name,
        link:`https://ybox.vn/tuyen-dung-viec-lam-tk-c1?keyword=${convertToSlug(formatName)}`
      }
    })

    for (const payload of payloadArr) {
       await getData(payload)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }) 
  .catch(err => console.error(err));



