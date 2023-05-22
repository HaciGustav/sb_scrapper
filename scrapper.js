const { Cluster } = require("puppeteer-cluster");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { compare, sendMail } = require("./functions");

const main = async () => {
  const apartments = [];
  const urls = ["https://www.sozialbau.at/angebot/sofort-verfuegbar/"];

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });
  cluster.on("taskError", (err, data) => {
    console.log(`ERRORRRRRRRR ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    await page.waitForSelector("tr");
    const productParent = await page.$$(
      "form.mobile-table > table > tbody > tr"
    );

    for (const product of productParent) {
      let adress = null;
      let adressUrl = null;
      let rooms = null;
      let equityCapital = null;
      let rentAmount = null;
      let url = null;

      try {
        adress = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(1) > a").textContent,
          product
        );
      } catch (error) {}
      try {
        adressUrl = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(5) > a").href,
          product
        );
      } catch (error) {}

      try {
        rooms = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(2)").textContent,
          product
        );
      } catch (error) {}

      try {
        equityCapital = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(3)").textContent,
          product
        );
      } catch (error) {}

      try {
        rentAmount = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(4)").textContent,
          product
        );
      } catch (error) {}

      try {
        url = await page.evaluate(
          (el) => el.querySelector("tr > td:nth-child(1) > a").href,
          product
        );
      } catch (error) {}

      if (true) {
        apartments.push({
          adress,
          adressUrl,
          rooms,
          equityCapital,
          rentAmount,
          url,
        });
        // console.log({
        //   adress,
        //   adressUrl,
        //   rooms,
        //   equityCapital,
        //   rentAmount,
        //   url,
        // });
      }
    }
  });
  for (const url of urls) {
    cluster.queue(url);
  }

  //! return apartments;

  const prevResults = fs.readFileSync("results.txt", "utf-8");

  await cluster.idle();
  await cluster.close();
  const compareResult = compare(apartments, JSON.parse(prevResults));
  if (!compareResult) {
    console.log("new");
    fs.writeFileSync("results.txt", JSON.stringify(apartments), "utf-8");
    await sendMail(apartments);
  }
};
main();
/* module.exports = async (req, res) => {
  try {
    // Tetikleyici çalıştığında bu fonksiyon çalışacak
    await main();

    // Başarılı yanıt döndürün
    res
      .status(200)
      .json({ message: "Tarama tamamlandı ve e-posta gönderildi." });
  } catch (error) {
    // Hata durumunda hata mesajı döndürün
    res.status(500).json({ error: "Bir hata oluştu." });
  }
}; */
