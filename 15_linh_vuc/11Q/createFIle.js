// const fs = require('fs');

// const arr = require('./11Q.json')

//     function createJsonFiles(array) {
//         array.forEach(item => {
//           const fileName = `${item}.json`; // Tên tệp tương ứng
//           const data = []; // Dữ liệu mẫu
      
//           // Ghi dữ liệu vào tệp JSON
//           fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
//             if (err) {
//               console.error(`Lỗi khi tạo tệp ${fileName}:`, err);
//             } else {
//               console.log(`Đã tạo tệp: ${fileName}`);
//             }
//           });
//         });
//       }
      
//       createJsonFiles(arr);


const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const dayjs = require('dayjs');
const arr = require('./11Q.json')

const crawData = async (payload) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://itviec.com/dang-nhap-tai-khoan');
    await page.type('#user_email', 'dau2k93@gmail.com');
    await page.type('#user_password', 'Nhd1503993@fpt');
    await page.click('button.ibtn.ibtn-md.ibtn-primary.w-100');
    await page.waitForNavigation();

    await page.goto(payload.link);
    
    const totalDocs = await page.evaluate(() => {
      const div = document.querySelector('.headline-total-jobs.search-header.text-it-black');
      return div ? div.innerText.match(/\d+/)[0] : 0;
    });

    const numberOfJobs = parseInt(totalDocs, 10);
    const totalPages = Math.ceil(numberOfJobs / 20);
    const results = [];
    

    const extractJobDetails = async (link) => {
      await page.goto(link.url);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return await page.evaluate(( link, today) => {
        const salary_range = () => {
          const elements = document.querySelectorAll('.ips-2');
            const texts = Array.from(elements).map(element => element.innerText);
              return texts[6] ? texts[6] : `You'll love it`;
      }

        const infors = () => {
          const divs = document.querySelectorAll('.d-flex.flex-column.gap-2');
          if (divs.length > 0) {
            const lastDiv = divs[divs.length - 1];
            return Array.from(lastDiv.children).map(child => child.innerText);
          }
          return [];
        };
  
        const skillsList = () => {
          const divs = document.querySelectorAll('.imt-2');
          if (divs.length > 0) {
            return divs.length > 0 ? [...new Set(Array.from(divs[0].querySelectorAll('*')).map(child => child.innerText.trim()).slice(1))]  : [];
          }
          return [];
        };
        
        const description = () => {
          const div = document.querySelectorAll('.imy-5.paragraph');
          return div.length > 0 ? Array.from(div[0].querySelectorAll('*')).map(child => child.innerText) : [];
        };
  
        const yc = () => {
          const div = document.querySelectorAll('.imy-5.paragraph');
          return div.length > 1 ? Array.from(div[1].querySelectorAll('*')).map(child => child.innerText) : [];
        };
  
  
        const urlCompany = () => {
          const div = document.querySelector('.ips-md-3 a');
          return div ? div.href : '';
        };
  
        const infor = infors()
       
        
        return {
          title: document.querySelector('h1')?.innerText,
          company: document.querySelector('.employer-name')?.innerText,
          salary_range: document.querySelectorAll('span.ips-2')[6]?.innerText,
          timeWork: document.querySelectorAll('.col.text-end.text-it-black')[4]?.innerText,
          timeOt: document.querySelectorAll('.col.text-end.text-it-black')[5]?.innerText,
          nation: document.querySelectorAll('.col.text-end.text-it-black')[3]?.innerText,
          company_model: document.querySelectorAll('.col.text-end.text-it-black')[0]?.innerText,
          company_size: document.querySelectorAll('.col.text-end.text-it-black')[2]?.innerText,
          linh_vuc:document.querySelector('.col.text-end.text-it-black.text-wrap-desktop')?.innerText,
          createdAt: infor[infor.length-2],
          description: description(),
          yc: yc(),
          linkJob: link.url,
          linkCompany: urlCompany(),
          crawlTime: today,
          address:infor.slice(0, -3),
          workplace:infor[infor.length-3],
          skills:skillsList()
        };

         
      }, link, dayjs().format('DD/MM/YYYY'));
    };

    for (let i = 1; i <= totalPages; i++) {
      await page.goto(`${payload.link}&page=${i}`);

      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h3')).map(h3 => ({
          text: h3.innerText,
          url: h3.getAttribute('data-url')
        }));
      });

      for (const link of links) {
        if (link.url) {
          const jobData = await extractJobDetails(link);
          results.push(jobData);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(results.length, 'kết quả');

    if (results.length > 0) {
      fss.writeFileSync(`${payload.fileName}`, JSON.stringify(results, null, 2));
      console.log(`Dữ liệu đã được lưu vào ${payload.fileName}`);
    }

    await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    return files.filter(name => name !== '11Q.json' && name !== 'createFIle.js' ); 
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

getListFileName()
  .then(async (data) => {
   const payloadArr = data.map((name)=>{
    const formatName = convertToSlug(name.slice(0,name.length-5))
      return {
        fileName:name,
        link:`https://itviec.com/viec-lam-it/${convertToSlug(formatName)}?`
      }
    })

    for (const payload of payloadArr) {
       await crawData(payload)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }) 
  .catch(err => console.error(err));
      