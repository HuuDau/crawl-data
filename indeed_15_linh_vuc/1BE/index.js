
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const fs = require('fs').promises;
const dayjs = require('dayjs');

const crawData = async (payload) => {
  try {
    const encodedString = encodeURIComponent(payload).replace(/%20/g, '+')
    console.log(encodedString)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let listOriginUrlKeySearch = []

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
      await page.goto(`https://jobs.vn.indeed.com/jobs?q=${encodedString}`);
      await page.waitForSelector('.jcs-JobTitle.css-1baag51.eu4oa1w0');

      const listLink = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.jcs-JobTitle.css-1baag51.eu4oa1w0')).map(link => link.href);
      });
 
      listOriginUrlKeySearch = [...listOriginUrlKeySearch, ...listLink]

      const extractJobDetails = async (link) => {
        await page.goto(link);
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        return await page.evaluate((link, today) => {
          const skillDev = () => {
            const elements = document.querySelectorAll('.text-title-post.text-primary');
            const texts = Array.from(elements).map(element => element?.innerText);
            return texts[0];
          };
          
          const companyUrl = ()=>{
            const url = document.querySelector('.css-1ioi40n.e19afand0');
            return url.href
          }
  
          const description = () => {
            const div = document.querySelector('#jobDescriptionText');
            if (div) {
              return Array.from(div.children).map(child => child?.innerText.replaceAll('\n', ' '));
            } else {
              return [];
            }
          };

          const title = () => {
            const div = document.querySelector('h1');
              return Array.from(div.children).map(child => child?.innerText);
          };
          const salary_range = ()=>{
            
            const elements = document.querySelectorAll('.js-match-insights-provider-tvvxwd.ecydgvn1');
            const texts = Array.from(elements).map(element => element?.innerText);
            return texts[0];
          }
  
          return {
            title: title()[0],
            urlCompany:companyUrl(),
            description: description(),
            linkJob: link,
            crawlTime: today,
            salary_range:salary_range(),
            skills: skillDev(),
          };
        }, link, dayjs().format('DD/MM/YYYY'));
      };
      const results =[]
      for(const link of listOriginUrlKeySearch){
        const data = await extractJobDetails(link);
        results.push(data)
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      fss.writeFileSync(`${payload}.json`, JSON.stringify(results, null, 2));
      console.log(`Dữ liệu đã được lưu vào ${payload}.json`);
    await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);

  }
};




const getListFileName = async () => {
  try {
    const files = await fs.readdir('.');
    const data = files.filter(name => name !== '1BE.json' && name !== 'createFIle.js' && name !== 'index.js');
    const listKeysearch = data.map((name) => name.slice(0, name.length - 5))
    return listKeysearch
  } catch (err) {
    throw err;
  }
}

getListFileName()
  .then(async (keySearch) => {
    for (const payload of keySearch) {
      await crawData(payload.trim())
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  })
  .catch(err => console.error(err));


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const getData = async () => {
//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     await page.goto('https://jobs.vn.indeed.com/jobs?q=Backend+Developer', { waitUntil: 'networkidle2', timeout: 60000 });

//     // Đợi cho các thẻ có class css-1ac2h1w và eu4oa1w0 xuất hiện
//     await page.waitForSelector('.css-1ac2h1w.eu4oa1w0', { timeout: 20000 });

//     // Lấy tất cả innerText của các thẻ có class css-1ac2h1w hoặc eu4oa1w0
//     const jobTitles = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('.css-1ac2h1w.eu4oa1w0')).map(element => element.innerText);
//     });
//     const allLinks = await page.evaluate(() => {
//       return Array.from(document.querySelectorAll('a')).map(link => link.href);
//     });
//     console.log(jobTitles, 'jobTitles');
// console.log(allLinks,'allLinks')
//     await browser.close();
//   } catch (error) {
//     console.log('Đã có lỗi:', error);
//   }
// };

// getData();




