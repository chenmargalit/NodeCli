const Page = require('./helpers/page');
// as these vars are defined in beforeEach, which is a function, it wont be available inside others functions, like our test.
let page;

// code here will be run before every test
beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
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

test('when signed in, shows logout button', async () => {
  await page.login();
  const text = await page.getContentOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});
