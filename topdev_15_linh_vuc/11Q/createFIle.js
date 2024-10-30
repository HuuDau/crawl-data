


const arr = require('./11Q.json')

const fs = require('fs').promises;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fss = require('fs');
const axios = require('axios') ;
const objJwt = require('../token.json')

const getListFileName = async () => {
  try {
    const files = await fs.readdir('.'); 
    return files.filter(name => name !== '11Q.json' && name !== 'createFIle.js' && name !== 'index.js'); 
  } catch (err) {
    throw err; 
  }
}

const getData = async (payload)=>{
  try {

    const response = await axios.get('https://api.topdev.vn/td/v2/suggested-units/', {
      params: {
        'keyword': payload.fileName.slice(0,payload.fileName.length-5),
        'locale': 'vi_VN'
      },
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'cookie': objJwt.cookie,
        'origin': 'https://topdev.vn',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://topdev.vn/',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
       'x-xsrf-token': objJwt.token
      }
    });
  
    const data=response?.data?.data
    if(data.length > 0){
      let listData = []
      for(const item of data){
        const result = await axios.get(`https://api.topdev.vn/td/v2/jobs?keyword=&region_ids=&skills_id=${item.id}&industries_ids=&job_levels_ids=&job_types_ids=&contract_types_ids=&salary_range=&experiences_id=&ordering=newest_job&company=&_f=50696&page=1&page_size=${objJwt.size}&locale=vi_VN&fields[job]=id,title,salary,slug,company,extra_skills,skills_str,skills_arr,skills_ids,job_types_str,job_levels_str,job_levels_arr,job_levels_ids,addresses,status_display,detail_url,job_url,salary,published,refreshed,applied,candidate,requirements_arr,packages,benefits,content,features,contract_types_ids,is_free,is_basic,is_basic_plus,is_distinction&fields[company]=tagline,addresses,skills_arr,industries_arr,industries_ids,industries_str,image_cover,image_galleries,num_job_openings,company_size,nationalities_str,skills_str,skills_ids,benefits,num_employees`,{
          headers: {
            'Cache-Control': 'no-cache',
              cookie:objJwt.cookie
          }})
     
          listData=[...listData,...result?.data?.data]
       
      }
      fss.writeFileSync(`${payload?.fileName}`, JSON.stringify(listData, null, 2));
      console.log(`Dữ liệu đã được lưu vào ${payload?.fileName}`);
    
    }else{
      console.log(`key search ${payload?.fileName} has no data`);
    }
   
  } catch (error) {
    console.log(error)
  }
}

  getListFileName().then(async (data) => {
    const payloadArr = data.map((name)=>{
       return {
         fileName:name,
       }
     })
 
     for (const payload of payloadArr) {
        await getData(payload)
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
   }) 
   .catch(err => console.error(err));