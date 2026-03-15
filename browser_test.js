import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:5173/login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('Taking screenshot of login page...');
    await page.screenshot({ path: 'screenshot_login.png', fullPage: true });
    console.log('Screenshot saved as screenshot_login.png');

    // Wait a moment for the page to fully render
    await page.waitForTimeout(1000);

    // Look for red buttons below the login form
    console.log('\nSearching for red SOS/emergency button...');
    
    // Try to find the SOS button by text content
    let redButton = null;
    
    // Search for elements containing "SOS" text
    const sosElements = await page.getByText('SOS', { exact: false }).all();
    console.log(`Found ${sosElements.length} elements containing "SOS"`);
    
    for (const element of sosElements) {
      const text = await element.textContent();
      console.log(`Element with SOS text: "${text?.trim()}"`);
      
      // Check if this is clickable
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      console.log(`Tag name: ${tagName}`);
      
      if (tagName === 'button' || tagName === 'a' || tagName === 'div') {
        redButton = element;
        break;
      }
    }
    
    // If not found, try broader search
    if (!redButton) {
      console.log('Trying alternative selectors...');
      const allClickables = await page.locator('button, a[href], div[class*="button"], div[role="button"]').all();
      
      for (const element of allClickables) {
        try {
          const text = await element.textContent();
          if (text && (text.includes('SOS') || text.includes('CỨU HỘ') || text.includes('KHẨN CẤP'))) {
            console.log(`Found emergency element with text: "${text?.trim()}"`);
            redButton = element;
            break;
          }
        } catch (e) {
          // Continue to next element
        }
      }
    }

    if (redButton) {
      console.log('\nClicking the red button...');
      await redButton.click();
      
      // Wait for any navigation or modal to appear
      await page.waitForTimeout(2000);
      
      console.log('Taking screenshot after clicking red button...');
      await page.screenshot({ path: 'screenshot_after_click.png', fullPage: true });
      console.log('Screenshot saved as screenshot_after_click.png');
    } else {
      console.log('No red button found! Listing all buttons on the page:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        console.log(`Button ${i + 1}: "${text?.trim()}"`);
      }
    }

    console.log('\nPage content analysis:');
    const pageText = await page.textContent('body');
    console.log('Page contains emergency/SOS text:', pageText.toLowerCase().includes('sos') || pageText.toLowerCase().includes('emergency'));

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshot_error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
})();
