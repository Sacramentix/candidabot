import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Fs, { FileHandle } from "fs/promises";
import { PathLike } from "fs";

console.log("App Started!")

var appConfig:AppConfig = await getJSON("appConfig.json");
var mail:MailAccount = await getJSON("mailAccount.json");
var transporter:Mail = await nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mail.username,
      pass: mail.password
    }
  });

async function main() {

  let t = Date.now();
  let d = new Date();
  d.setTime(t);
  console.log("===========================================");
  console.log(d.toLocaleTimeString()+" New revival !");
  let config:Revival = await getJSON("revival.json");
  let info:Info = await getJSON("mailInfo.json");
  let firstHTML:string = await getFile("first.min.html");
  let revivalHTML:string = await getFile("revival.min.html");
  for (var r of config.revivals) {
    if (r.hasAnswer) return;
    if(r.n >= appConfig.maxRevivals) return;
    if (r.timestamp + appConfig.revivalsDelay > t) return;
    r.timestamp = t;
    console.log("revival of "+r.name+" n°"+r.n);
    let res = transporter.sendMail({
        from: (r.n == 0 ? info.first.sender : info.revival.sender )+" <"+mail.username+">", // sender address
        to: r.mail, // list of receivers
        subject: (r.n == 0 ? info.first.subject : info.revival.subject ), // Subject line
        html: (r.n == 0 ? firstHTML : revivalHTML )
      }).catch(e => {
        console.log("Mail error");
      });
    r.n++;
  }
  await Fs.writeFile("config/revival.json", JSON.stringify(config, null, "  "));
}

async function getFile(fileName:PathLike | FileHandle) {
  return (await Fs.readFile("config/"+fileName)).toString();
}
async function getJSON(fileName:PathLike | FileHandle) {
  return JSON.parse((await Fs.readFile("config/"+fileName)).toString());
}
main().catch(console.error);
setInterval(async () => {
  await main().catch(console.error);
},appConfig.checkDelay);

interface JobsRevival {
  name: string,
  timestamp: number,
  mail: string,
  hasAnswer: boolean,
  n: number
}

interface Revival {
  revivals:JobsRevival[]
}

interface MailInfo {
  sender: string,
  subject: string
}

interface Info {
  first: MailInfo,
  revival: MailInfo
}

interface MailAccount {
  username: string,
  password: string
}

interface AppConfig {
  mailDelay: number,
  checkDelay: number,
  maxRevivals: number,
  revivalsDelay: number
}

