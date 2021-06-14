import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Fs, { FileHandle } from "fs/promises";
import { PathLike } from "fs";

var delay = 248400000;
var mail = await getFile("mail_config.json");
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
  console.log(d.toLocaleTimeString()+" New revival !")
  var file:Revival = await getFile("revival.json");
  for (var r of file.revivals) {
    if (r.hasAnswer) return;
    if(r.n >= 3) return;
    if (r.timestamp+delay > t) return;
    r.timestamp = t;
    console.log("revival of "+r.name+" n°"+r.n);
    let info = transporter.sendMail({
        from: mail.username, // sender address
        to: r.mail, // list of receivers
        subject: "relance", // Subject line
        text: "relance n° " + r.n
      });
    r.n++;
  }
  await Fs.writeFile("revival.json", JSON.stringify(file, null, "  "));
}

async function getFile(fileName:PathLike | FileHandle) {
  return JSON.parse((await Fs.readFile(fileName)).toString());
}
setInterval(async () => {
  await main().catch(console.error);
},300000);



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


