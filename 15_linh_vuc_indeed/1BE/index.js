// await page.type('#text-input-what', payload?.keySearch);


// const fs = require('fs');

      
const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const dayjs = require('dayjs');


const getCrawl = async ()=>{

}


const crawData = async (payload) => {
  try {
    console.log(payload)
    const encodedString = encodeURIComponent(payload).replace(/%20/g, '+')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://jobs.vn.indeed.com/');
 
    await page.type('#text-input-what', payload);

    await page.click('button.yosegi-InlineWhatWhere-primaryButton');
    await page.waitForNavigation();
    await page.goto(`https://jobs.vn.indeed.com/jobs?q=${encodedString}`);

    const listLink = await page.evaluate(()=>{
        const links = document.querySelectorAll('a.jcs-JobTitle.css-1baag51.eu4oa1w0');
        const hrefs = Array.from(links).map(link => link.href);
        return hrefs
    })
   
    const arrTitle=[]
    for (const link of listLink) {
      await page.goto(link)
      const crawlData = await page.evaluate(()=>{
        const elements = document.querySelectorAll('h1');
          const texts = Array.from(elements).map(element => element.innerText);
            return texts[0];
      })
      arrTitle.push(crawlData) 
   }
   console.log(arrTitle,'arrayTitle')
    await browser.close();
  } catch (error) {
    console.error('Lỗi:', error);
  }
};



const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    const data = files.filter(name => name !== '4F.json' && name !== 'createFIle.js' && name !== 'index.js' );  
    const listKeysearch = data.map((name)=> name.slice(0,name.length -5))
  return listKeysearch
  } catch (err) {
    throw err; 
  }
}

const listName = getListFileName()
  .then(async (keySearch) => {
    console.log(keySearch)
    for (const payload of keySearch) {
       await crawData(payload.trim())
    }
  }) 
  .catch(err => console.error(err));


      
  