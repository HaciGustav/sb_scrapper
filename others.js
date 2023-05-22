const nodemailer = require("nodemailer");
require("dotenv").config();

const compare = (par1, par2) => {
  let equality = true;
  if (par2.length < 1 || par1.length !== par2.length) {
    return false;
  }
  for (let i = 0; i < par1.length; i++) {
    const obj1 = Object.values(par1[i]);
    const obj2 = Object.values(par2[i]);
    // console.log(i, equality);
    obj1.forEach((item, i) => {
      if (obj1[i] === obj2[i]) {
        // console.log("true");
        // equality = true;
      } else {
        equality = false;
        // console.log("false");
      }
    });
  }
  return equality;
};

const sendMail = async (apartments) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: [
      "mehmetfkuruldak@gmail.com",
      "gustavelebon1941@gmail.com",
      "mehmetkuruldak@gmail.com",
    ],
    subject: "Sozialbau tarama sonuçları",
    text: "Web sitesi sonuçları değişti. Yeni sonuç ektedir.",
    html: `<body>
    ${apartments?.map((item) => {
      return `
        <div style="padding: 5px; border: 5px solid darkred; border-radius:15px 0 15px 0; list-style-type: none; font-family: Arial, Helvetica, sans-serif;">
<p style="color:#fff;">⫸ <a href="${item.adressUrl}"  style="color: #000;   ">Adresse: ${item.adress}</a></p>
<p style="color:#fff;">⫸ Zimmer: ${item.rooms}</p>
<p style="color:#fff;">⫸ Eigenmittel: ${item.equityCapital}</p>
<p style="color:#fff;">⫸ Miete: ${item.rentAmount}</li>
<p style="color:#fff;">⫸<a style="color: #000; text-align: center; text-decoration: none;  width: 100px; height: 100px; padding: 10px; border-radius: 50%;  font-size: 2rem;" href=" ${item.adressUrl}"> 📍🗺️ </a></p>
    </div>
        `;
    })}
    </body>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("E-posta gönderme hatası:", error);
    } else {
      console.log("E-posta gönderildi:", info.response);
    }
  });
};

module.exports = { compare, sendMail };
