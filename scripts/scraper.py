import requests
from bs4 import BeautifulSoup
import json

API_URL = "http://localhost:3000/api/articles"

def scrape_devto_articles():
    url = "https://dev.to/t/node"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"❌ Erro ao acessar {url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    articles = []

    for post in soup.find_all("div", class_="crayons-story")[:5]:
        title_tag = post.find("h2")
        link_tag = title_tag.find("a") if title_tag else None
        title = link_tag.text.strip() if link_tag else "Sem título"
        link = f"https://dev.to{link_tag['href']}" if link_tag else "Sem link"
        summary_tag = post.find("p")
        summary = summary_tag.text.strip() if summary_tag else "Sem resumo"

        articles.append({
            "title": title,
            "summary": summary,
            "url": link
        })

    return articles

def get_existing_articles():
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"⚠️ Erro ao buscar artigos existentes: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Erro de conexão com API: {e}")
        return []

def send_to_api(article):
    try:
        response = requests.post(
            API_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(article)
        )
        if response.status_code in [200, 201]:
            print(f"✅ Enviado: {article['title']}")
        else:
            print(f"⚠️ Falha ao enviar {article['title']} (Status {response.status_code})")
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    scraped_articles = scrape_devto_articles()
    existing_articles = get_existing_articles()

    existing_urls = {a['url'] for a in existing_articles}

    for article in scraped_articles:
        if article['url'] not in existing_urls:
            send_to_api(article)
        else:
            print(f"🔁 Já existe: {article['title']}")
