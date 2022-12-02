const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const ejs = require('ejs');
const Product = require('../models/productModel');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.user = user;
    this.url = url;
    this.from = `UBIM <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   //sendgrid
    //   return 1;
    // }

    return nodemailer.createTransport({
      service: 'gmail',
      type: 'SMTP',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, data) {
    const bestProducts = await Product.find()
      .sort({ ratingAverage: -1, createdAt: 1 })
      .limit(3);

    const prod1img = bestProducts[0].imageCover.isExternal
      ? bestProducts[0].imageCover.url
      : `${process.env.BACK_END_URL}/images/products/${bestProducts[0].imageCover.url}`;

    const prod2img = bestProducts[1].imageCover.isExternal
      ? bestProducts[1].imageCover.url
      : `${process.env.BACK_END_URL}/images/products/${bestProducts[1].imageCover.url}`;

    const prod3img = bestProducts[2].imageCover.isExternal
      ? bestProducts[2].imageCover.url
      : `${process.env.BACK_END_URL}/images/products/${bestProducts[2].imageCover.url}`;

    const prod1name = bestProducts[0].title;
    const prod2name = bestProducts[1].title;
    const prod3name = bestProducts[2].title;

    const prod1rate = bestProducts[0].ratingsAverage;
    const prod2rate = bestProducts[1].ratingsAverage;
    const prod3rate = bestProducts[2].ratingsAverage;

    const prod1desc = bestProducts[0].description.substring(0, 100) + '...';
    const prod2desc = bestProducts[1].description.substring(0, 100) + '...';
    const prod3desc = bestProducts[2].description.substring(0, 100) + '...';

    const prod1url = `${process.env.FRONT_END_URL}/formations/${bestProducts[0]._id}`;
    const prod2url = `${process.env.FRONT_END_URL}/formations/${bestProducts[1]._id}`;
    const prod3url = `${process.env.FRONT_END_URL}/formations/${bestProducts[2]._id}`;

    //render html based on a ejs template
    const html = await ejs.renderFile(
      `${__dirname}/../views/email/${template}.ejs`,
      {
        user: this.user,
        url: this.url,
        prod1img,
        prod2img,
        prod3img,
        prod1name,
        prod2name,
        prod3name,
        prod1rate,
        prod2rate,
        prod3rate,
        prod1desc,
        prod2desc,
        prod3desc,
        prod1url,
        prod2url,
        prod3url,
        subject,
        data,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome_to_ubim', 'Welcome to the UBIM Family!');
  }

  async sendVerifyEmail() {
    await this.send(
      'verify_email',
      'Your Email verification token (valid for 10 minutes)'
    );
  }

  async sendForgotPassword() {
    await this.send(
      'forget_password',
      'Your password reset token (valid for 10 minutes)'
    );
  }

  async sendOrder(productTitle, contactNumber) {
    await this.send(
      'order-confirm',
      'Your order has been successfully placed! Thank you for choosing UBIM',
      { productTitle, contactNumber }
    );
  }

  async sendNewsLetter() {
    await this.send('newsletter', 'UBIM Newsletter');
  }

  async sendBecomeInstructor() {
    await this.send('become_instructor', 'Become an instructor');
  }

  async sendBecomeUBIMBusiness() {
    await this.send('ubim_business', 'Become a UBIM Business');
  }
};
