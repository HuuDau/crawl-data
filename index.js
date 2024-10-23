
const puppeteer = require('puppeteer-core');
const connectionURL = 'wss://browser.zenrows.com?apikey=8e269370f87a92768df84aaa7e0b17a2c017c207';
const fs = require('fs');
const dayjs = require('dayjs');

const crawData = async () => {
  try {
    const browser = await puppeteer.connect({ browserWSEndpoint: connectionURL });
    const page = await browser.newPage();
    
    await page.goto('https://itviec.com/dang-nhap-tai-khoan');

    await page.type('#user_email', 'nguyendauhalf3@gmail.com');
    await page.type('#user_password', 'Nhd1503993@fpt');
    await page.click('button.ibtn.ibtn-md.ibtn-primary.w-100');
    await page.waitForNavigation();
    // form-control is-valid
    await page.goto('https://itviec.com/viec-lam-it/chuyen-gia-lap-trinh');
    
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
      
      const infoSkill = await page.evaluate(() => {
        const divs = document.querySelectorAll('.d-flex.flex-column.gap-2');
        if (divs.length > 0) {
          const lastDiv = divs[divs.length - 1];
          return Array.from(lastDiv.children).map(child => child.innerText);
        }
        return [];
      });

      const skills = await page.evaluate(() => {
        const divs = document.querySelectorAll('.imt-2');
        if (divs.length > 0) {
          return divs.length > 0 ? [...new Set(Array.from(divs[0].querySelectorAll('*')).map(child => child.innerText.trim()).slice(1))]  : [];
        }
        return [];
      });
      
      

      const innerTextsDes = await page.evaluate(() => {
        const div = document.querySelectorAll('.imy-5.paragraph');
        return div.length > 0 ? Array.from(div[0].querySelectorAll('*')).map(child => child.innerText) : [];
      });

      const innerTextsRequest = await page.evaluate(() => {
        const div = document.querySelectorAll('.imy-5.paragraph');
        return div.length > 1 ? Array.from(div[1].querySelectorAll('*')).map(child => child.innerText) : [];
      });


      const urlCompany = await page.evaluate(() => {
        const div = document.querySelector('.ips-md-3 a');
        return div ? div.href : '';
      });

      const innerTextsAddress = await page.evaluate(() => {
        const div = document.querySelector('.d-inline-block.text-dark-grey');
        return div ? div[0]?.innerText : '';
      });
      
     
      
      return await page.evaluate((description, yc, link, urlCompany, today,address,infor,skillsList) => {
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
          description: description,
          yc: yc,
          linkJob: link.url,
          linkCompany: urlCompany,
          crawlTime: today,
          address:infor.slice(0, -3),
          workplace:infor[infor.length-3],
          skills:skillsList
        };
      }, innerTextsDes, innerTextsRequest, link, urlCompany, dayjs().format('DD/MM/YYYY'),innerTextsAddress,infoSkill,skills);
    };

    for (let i = 1; i <= totalPages; i++) {
      await page.goto(`https://itviec.com/viec-lam-it/chuyen-gia-lap-trinh&page=${i}`);

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
      fs.writeFileSync('data.json', JSON.stringify(results, null, 2));
      console.log('Dữ liệu đã được lưu vào data.json');
    }

    await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

crawData();








const createFolder = () => {

  const folderPath = './15_linh_vuc';

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Thư mục ${folderPath} đã được tạo.`);
  } else {
    console.log(`Thư mục ${folderPath} đã tồn tại.`);
  }

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return console.error(`Error create folder: ${err}`);
    }

    const fileList = files.filter(file => fs.statSync(path.join(folderPath, file)).isFile());

    fileList.forEach(file => {
      const newFolderName = path.basename(file, path.extname(file));
      const newFolderPath = path.join(folderPath, newFolderName);

      fs.mkdir(newFolderPath, { recursive: true }, (err) => {
        if (err) {
          console.error(`Error create folder ${newFolderName}:`, err);
        } else {
          console.log(`create folder success: ${newFolderName}`);
        }
      });
    });
  });
}




