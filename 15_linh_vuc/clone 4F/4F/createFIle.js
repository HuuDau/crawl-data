

// const fs = require('fs');

      
const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const dayjs = require('dayjs');

const arr  = require('./4F.json')

const crawData = async (payload) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://itviec.com/dang-nhap-tai-khoan');
 
    const userInput = await page.$('.form-control.is-valid:nth-of-type(1)');
    if (userInput) {
      await userInput.type('nguyendauhalf3@gmail.com');
    }
    
    const passwordInput = await page.$('.form-control.is-valid:nth-of-type(2)');
    if (passwordInput) {
      await passwordInput.type('Nhd1503993@fpt');
    }
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
    return files.filter(name => name !== '4F.json' && name !== 'createFIle.js' ); 
  } catch (err) {
    throw err; 
  }
}

const listLisk = [
  'https://itviec.com/viec-lam-it/chuyen-gia-lap-trinh',
  'https://itviec.com/viec-lam-it/chuyen-vien-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/chuyen-vien-lap-trinh',
  'https://itviec.com/viec-lam-it/can-bo-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/can-bo-lap-trinh',
  'https://itviec.com/viec-lam-it/cong-tac-vien-lap-trinh',
  'https://itviec.com/viec-lam-it/developer?job_selected=senior-backend-developer-c-net-8-net-core-ambitionplus-custom-solutions-1127',
  'https://itviec.com/viec-lam-it/expert-developer?job_selected=expert-wordpress-developer-employment-hero-1032',
  'https://itviec.com/viec-lam-it/freher-developer',
  'https://itviec.com/viec-lam-it/freher-frontend-developer',
  'https://itviec.com/viec-lam-it/frontend-developer?job_selected=sr-frontend-developer-vuejs-start-up-data-platform-recurve-4742',
  'https://itviec.com/viec-lam-it/frontend-leader?job_selected=technical-leader-c-frontend-net-php-aws-ivc-isb-vietnam-3654',
  'https://itviec.com/viec-lam-it/frontend-software-developer?job_selected=senior-frontend-developer-typescript-react-net-scandinavian-software-park-0742',
  'https://itviec.com/viec-lam-it/frontend-software-engineer?job_selected=front-end-software-engineer-angular-enlab-software-0757',
  'https://itviec.com/viec-lam-it/frontent-expert',
  'https://itviec.com/viec-lam-it/hoc-vien-lap-trinh',
  'https://itviec.com/viec-lam-it/intern-fe-developer',
  'https://itviec.com/viec-lam-it/junior-developer?job_selected=junior-c-developer-dts-software-vietnam-2346',
  'https://itviec.com/viec-lam-it/junior-frontend-developer?job_selected=junior-senior-frontend-developer-reactjs-fullerton-health-5818',
  'https://itviec.com/viec-lam-it/ky-su-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/ky-su-lap-trinh',
  'https://itviec.com/viec-lam-it/ky-su-phan-mem-frontend',
  'https://itviec.com/viec-lam-it/ky-su-phan-mem?job_selected=viettel-ai-ky-su-phat-trien-phan-mem-viettel-group-1743',
  'https://itviec.com/viec-lam-it/lap-trinh-vien-chuyen-vien-cao-cap',
  'https://itviec.com/viec-lam-it/lap-trinh-vien-chuyen-vien-chinh',
  'https://itviec.com/viec-lam-it/lap-trinh-vien-frontend?job_selected=sr-frontend-developer-vuejs-start-up-data-platform-recurve-4742',
  'https://itviec.com/viec-lam-it/lap-trinh-vien-tap-su',
  'https://itviec.com/viec-lam-it/lap-trinh-vien?job_selected=senior-backend-developer-c-net-8-net-core-ambitionplus-custom-solutions-1127',
  'https://itviec.com/viec-lam-it/mid-level-developer',
  'https://itviec.com/viec-lam-it/mid-level-frontend-developer',
  'https://itviec.com/viec-lam-it/nhan-vien-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/pho-phong-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/product-manager?search_by_skill=true&click_source=Recommendation&job_selected=lead-product-manager-data-platforms-grab-vietnam-ltd-5138',
  'https://itviec.com/viec-lam-it/product-owner?search_by_skill=true&click_source=Recommendation&job_selected=product-owner-business-analyst-market-research-vnpt-epay-2832',
  'https://itviec.com/viec-lam-it/project-manager?search_by_skill=true&click_source=Recommendation&job_selected=embedded-project-manager-joining-bonus-bosch-global-software-technologies-company-limited-3135',
  'https://itviec.com/viec-lam-it/senior-developer?job_selected=senior-android-developer-kotlin-relocate-to-germany-vita-vietnam-international-talent-alliance-5257',
  'https://itviec.com/viec-lam-it/senior-frontend-developer?job_selected=frontend-developer-nextjs-reactjs-javascript-bluebottle-digital-viet-nam-3250',
  'https://itviec.com/viec-lam-it/sinh-vien-tai-nang-cong-nghe',
  'https://itviec.com/viec-lam-it/sinh-vien-tap-su-cong-nghe',
  'https://itviec.com/viec-lam-it/software-developer?job_selected=software-developer-c-c-shinhan-ds-3638',
  'https://itviec.com/viec-lam-it/tech-lead?job_selected=net-tech-lead-joining-bonus-up-to-55mil-elca-0604',
  'https://itviec.com/viec-lam-it/thuc-tap-lap-trinh',
  'https://itviec.com/viec-lam-it/thuc-tap-sinh-lap-trinh',
  'https://itviec.com/viec-lam-it/thuc_tap_sinh_lap_trinh?job_selected=lap-trinh-vien-python-backend-med-aid-0247',
  'https://itviec.com/viec-lam-it/truong-nhom-lap-trinh-frontend',
  'https://itviec.com/viec-lam-it/truong-phong-lap-trinh-frontend'

]

getListFileName()
  .then(async (data) => {
   
   const payloadArr = data.map((name,index)=>{
      return {
        fileName:name,
        link:listLisk[index]
      }
    })

    for (const payload of payloadArr) {
      await crawData(payload)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }) 
  .catch(err => console.error(err));
      
  