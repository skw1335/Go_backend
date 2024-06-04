from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv

# Initalize a bunch of arrays to store each individual attribute

Names = []
Reviews = []
Stars = []
Stars_count = []
Addresses = []
database = {}


Overall_database = {}
# Initialize the webdriver
driver = webdriver.Chrome()
def WebScraper(url):
    # Open the desired webpage
    driver.get(url)
# Wait for the main elements to be present
    WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "hfpxzc")))

# Scroll to load more elements

# Now find the elements
    actions = ActionChains(driver)
    for _ in range(50):
        names = driver.find_elements(By.CLASS_NAME, "hfpxzc")
        reviews_and_ratings = driver.find_elements(By.CLASS_NAME, "ZkP5Je")
        info = driver.find_elements(By.CLASS_NAME, "W4Efsd")
        actions.send_keys(3*Keys.ARROW_DOWN).perform()
        time.sleep(1)

# Print the number of elements found

# Iterate through the elements and access the 'aria-label' attribute
    for index, name in enumerate(names): 
        store_name = name.get_attribute("aria-label")
        Names.append(store_name)
    for i, parent in enumerate(info):
        location = parent.find_elements(By.XPATH, "./*")
    print(Names)
    for j, child in enumerate(location):
        if j == 0 and child.tag_name == 'div': 
            tag_name = child.tag_name 
            text_content = child.text
            text_content = text_content.split(',')
            Reviews.append(text_content)
    for i, rating in enumerate(Reviews):
        if i % 2 == 0:
            s = ''.join(rating)
            tmp = s.split('·')
            review_count_and_rating = tmp[0]
            review = review_count_and_rating[:3]
            rating = review_count_and_rating[3:]
            Stars.append(review)
            Stars_count.append(rating)
        else: 
            s = ''.join(rating)
            tmp = s.split('·')
            Addresses.append(tmp[-1])
    
    index = min(len(Names), len(Stars), len(Stars_count))
    print(index)
    for i in range(index):
        database[Names[i]] = [Stars[i], Stars_count[i], Addresses[i]]
    
    with open('Overall_database.csv', 'w') as f:
        w = csv.writer(f)
        for key, value in database.items():
            w.writerow([key, value])

    Overall_database.update(database)
    
    driver.close()


# def WebScraper_iter():
    #WebScraper("https://www.google.com/maps/search/coffee+shop+in+boston/")
    #WebScarper("https://www.google.com/maps/search/coffee+shop+in+brookline/")
    #WebScraper("https://www.google.com/maps/search/coffee+shop+in+cambridge/")

WebScraper("https://www.google.com/maps/search/coffee+shop+in+boston/")

