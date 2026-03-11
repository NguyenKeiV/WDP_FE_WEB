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
    console.log('\nSearching for red buttons...');
    
    // Try to find buttons by various selectors that might indicate a red/SOS/emergency button
    const redButtonSelectors = [
      'button[style*="red"]',
      'button[class*="red"]',
      'button[class*="emergency"]',
      'button[class*="sos"]',
      'button[class*="danger"]',
      '.btn-danger',
      '.emergency-btn',
      '.sos-btn'
    ];

    let redButton = null;
    for (const selector of redButtonSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.count() > 0) {
          console.log(`Found button with selector: ${selector}`);
          redButton = button;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // If no specific selector worked, try to find any button that appears red by checking computed styles
    if (!redButton) {
      console.log('Trying to find red button by color...');
      const allButtons = await page.locator('button').all();
      
      for (const button of allButtons) {
        try {
          const bgColor = await button.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundColor;
          });
          
          const text = await button.textContent();
          console.log(`Button text: "${text?.trim()}", Background: ${bgColor}`);
          
          // Check if color is red-ish (rgb values where red > 150 and others < 100)
          if (bgColor && (
            bgColor.includes('rgb(220') || 
            bgColor.includes('rgb(239') ||
            bgColor.includes('rgb(185') ||
            bgColor.includes('rgb(255') ||
            bgColor.toLowerCase().includes('red')
          )) {
            console.log(`Found red button with text: "${text?.trim()}"`);
            redButton = button;
            break;
          }
        } catch (e) {
          // Continue to next button
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
