const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can see blog form', async () => {
    const label = await page.getContentOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid inputs', () => {
    beforeEach(async () => {
      await page.type('.title input', 'Some title');
      await page.type('.content input', 'Some content');
      await page.click('form button');
    });

    test('submitting takes user to review screen', async () => {
      const headline = await page.getContentOf('h5');
      expect(headline).toEqual('Please confirm your entries');
    });

    // test('submitting then saving, adds blog to index page', async () => {
    //   page.click('.green.btn-flat.right');
    //   page.waitFor('');
    //   const headline = page.getContentOf('.card-title');
    //   expect(headline).toEqual('Some title');
    // });
  });

  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('the form shows an error message', async () => {
      const titleError = await page.getContentOf('.title .red-text');
      const contentError = await page.getContentOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When user is not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ];
  test('Blog related actions are not allowed', async () => {
    const results = await page.execRequest(actions);
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
});
