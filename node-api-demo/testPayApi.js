const axios = require('axios');
const https = require('https');
const qs = require('qs');
const crypto = require('crypto');
function generateMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

function generateTimestampOrderNumber() {
        const timestampPart = Date.now().toString().slice(-5); 
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        return (timestampPart + randomPart).substring(0, 10);
    }

const API_URL = 'https://testurl.carespay.com:28081/carespay/pay';

const shippingLastName="b";
const shippingFirstName="a";
const shippingCountry="United States";
const shippingCity="f";
const shippingAddress="c";
const shippingZipCode="e";
const shippingEmail="a@qq.com";
const shippingPhone="18811111111";
const merNo="100140";
const billNo="100140" + generateTimestampOrderNumber();
const currency="1";
const amount="10.12";
const returnURL="123";
const md5Key="^Qdb}Kzy";
const signStr = merNo + billNo + currency + amount + returnURL + md5Key;
const sign = generateMD5(signStr);


const data = {
  shippingEmail: shippingEmail,
  shippingPhone: shippingPhone,
  shippingCountry: shippingCountry,
  shippingState:"ccc",
  shippingFirstName: shippingFirstName,
  shippingLastName: shippingLastName,
  shippingAddress: shippingAddress,
  apartment: "d",
  shippingZipCode: shippingZipCode,
  shippingCity: shippingCity,
  billNo: billNo,
  md5_key: md5Key,
  currency: currency,
  language: "en",
  merNo: merNo,
  returnURL: returnURL,
  noticeUrl:"aaa",
  tradeUrl:"bbb",
  lastName:shippingLastName,
  firstName:shippingFirstName,
  country:shippingCountry,
  state:"123",
  city:shippingCity,
  address:shippingAddress,
  zipCode:shippingZipCode,
  email:shippingEmail,
  ip:"127.0.0.1",
  cookie:"123",
  phone:shippingPhone,
  cardBank:"sdfdghdh",
  productInfo:"product_info",
  nationalCode:"us",
  cardTypeId:"1",
  cardNum:"4111111111111111",
  month:"09",
  year:"2029",
  cvv2:"123",
  amount:amount,
  md5Info: sign
};



axios.post(API_URL, qs.stringify(data), {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
})
.then(response => {
  console.log('data:', response.data);
})
.catch(error => {
  console.error('error:', error.response ? error.response.data : error.message);
});