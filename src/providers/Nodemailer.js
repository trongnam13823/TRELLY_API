import { createTransport } from 'nodemailer'

class Nodemailer {
  transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    }
  })

  async sendMail(mailOptions) {
    return await this.transporter.sendMail(mailOptions)
  }
}

export default new Nodemailer()
