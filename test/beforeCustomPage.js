const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

// as these vars are defined in beforeEach, which is a function, it wont be available inside others functions, like our test.
let browser, page;

// code here will be run before every test
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false
  });
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await browser.close();
});

test('The header has the correct text', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  expect(url).toMatch('/accounts.google.com');
});

test.only('when signed in, shows logout button', async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: 'express:sess', value: session });
  await page.setCookie({ name: 'express:sess.sig', value: sig });

  await page.goto('http://localhost:3000');
  // as everything runs as fast as possible, our eval test runs before the button is uplodaded, hence it fails because it cannot find what is not yet there. This waitFor method will allow us to wait for the button before running more tests functions.
  await page.waitFor('a[href="/auth/logout"]');

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual('Logout');
});
