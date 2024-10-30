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
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let listOriginUrlKeySearch = []

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
      await page.goto(`https://jobs.vn.indeed.com/jobs?q=${encodedString}`);

      await new Promise(resolve => setTimeout(resolve, 30000));

      let hasNextPage = await page.$('a[data-testid="pagination-page-next"]') !== null;
  if (hasNextPage) {
    console.log("Có phần tử với data-testid='pagination-page-next'");
  } else {
    console.log("Không tìm thấy phần tử với data-testid='pagination-page-next'");
  }
  while (hasNextPage) {
    const listLink = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.jcs-JobTitle.css-1baag51.eu4oa1w0')).map(link => link.href);
    });
  
    listOriginUrlKeySearch = [...listOriginUrlKeySearch, ...listLink];
  
    hasNextPage = await page.$('a[data-testid="pagination-page-next"]') !== null;
    if (hasNextPage) {
      await page.click('a[data-testid="pagination-page-next"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }); 
    }
  }


      const extractJobDetails = async (link) => {
        await page.goto(link)
        const datas = await page.evaluate((link,today) => {
      
          const companyUrl = ()=>{
            const url = document.querySelector('.css-1ioi40n.e19afand0');
            return url?.href || undefined
          }
    
          const description = () => {
            const div = document.querySelector('#jobDescriptionText');
            if (div) {
              return Array.from(div.children).map(child => child?.innerText.replaceAll('\n', ' '));
            } else {
              return [];
            }
          };
    
          const workPlace  =()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Địa điểm làm việc:");
            if (locationElement && locationElement.nextSibling) {
                return locationElement.nextSibling.textContent.trim();
            }
            return null;
          }
          const luong  =()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Lương:");
            if (locationElement && locationElement?.nextSibling) {
                return locationElement.nextSibling?.textContent.trim();
            }
            return null;
          }
          
          const linhVuc = ()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Lĩnh vực:");
            if (locationElement && locationElement?.nextSibling) {
                return locationElement.nextSibling?.textContent.trim();
            }
            return null;
          }
           
          const members = ()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Số lượng cần tuyển:");
            if (locationElement && locationElement?.nextSibling) {
                return locationElement.nextSibling?.textContent.trim();
            }
            return null;
          }
    
          const benefit = ()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Quyền lợi:");
            if (locationElement && locationElement?.nextSibling) {
                return locationElement.nextSibling?.textContent.trim();
            }
            return null;
    
          }
          
          const otherBenefit = ()=>{
            const jobRequirementElement = Array.from(document.querySelectorAll("b"))
            .find(b => b?.innerText.trim() === "Other Benefits:");
    
        if (jobRequirementElement) {
            const ulElement = jobRequirementElement.nextElementSibling?.nextElementSibling;
            if (ulElement && ulElement?.tagName === "UL") {
                return Array.from(ulElement.querySelectorAll("li")).map(li => li?.innerText.trim());
            }
        }
    
        return null;
          }
    
          const title = () => {
            const div = document.querySelector('h1');
              return Array.from(div.children).map(child => child?.innerText);
          };
          const salary_range = ()=>{
            // 
            const elements = document.querySelectorAll('.js-match-insights-provider-e6s05i.eu4oa1w0');
            const texts = Array.from(elements).map(element => element?.innerText);
            const target = texts.find((text)=> text.includes(`Pay\n`))
            return  target ? target.replace('Pay\n','')  : undefined;
          }
          const degree = ()=>{
            const locationElement = Array.from(document.querySelectorAll("b"))
            .find(b => b.innerText.trim() === "Bằng cấp:");
            if (locationElement && locationElement?.nextSibling) {
                return locationElement.nextSibling?.textContent.trim();
            }
            return null;
              }
    
              const remoteJob = ()=>{
                const locationElement = Array.from(document.querySelectorAll("b"))
                .find(b => b.innerText.trim() === "Loại hình công việc:");
                if (locationElement && locationElement?.nextSibling) {
                    return locationElement.nextSibling?.textContent.trim();
                }
                return null;
                  }
    
                  const yc = ()=>{
                    const jobRequirementElement = Array.from(document.querySelectorAll("b"))
                    .find(b => b?.innerText.trim() === "Yêu cầu công việc :");
                
                if (jobRequirementElement) {
                    const ulElement = jobRequirementElement.nextElementSibling?.nextElementSibling;
                    if (ulElement && ulElement?.tagName === "UL") {
                        return Array.from(ulElement.querySelectorAll("li")).map(li => li?.innerText.trim());
                    }
                }
        
                return null;
                      }
    
          return {
            title: title()[0],
            urlCompany:companyUrl(),
            description: description(),
            crawlTime: today,
            salary_range:salary_range(),
            local:workPlace(),
            salary:luong(),
            linhVuc:linhVuc(),
            members:members(),
            benefit:benefit(),
            degree:degree(),
            remoteJob:remoteJob(),
            linkJob:link,
            yc:yc(),
            otherBenefit:otherBenefit(),
    
          };
        }, link,dayjs().format('DD/MM/YYYY'));
      return datas
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
    const data = files.filter(name => name !== '2BA.json' && name !== 'createFIle.js' && name !== 'index.js');
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
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
  })
  .catch(err => console.error(err));

