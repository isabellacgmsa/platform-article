#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin, urlparse
import uuid
from datetime import datetime
import time

if sys.platform == "win32":
    import io
    import sys
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
TIMEOUT = 20 
MAX_ARTICLES = 10

SOURCES = {
    'devto': {
        'url': 'https://dev.to/t/node',
        'selectors': {
            'articles': 'div.crayons-story',
            'title': 'h2 a',
            'link': 'h2 a',
            'summary': 'div.crayons-story__teaser'
        },
        'headers': {
            'User-Agent': USER_AGENT,
            'Accept-Language': 'en-US,en;q=0.9'
        }
    },
    'nodesource': {
        'url': 'https://nodesource.com/blog/',
        'selectors': {
            'articles': 'article.post',
            'title': 'h2.entry-title a',
            'link': 'h2.entry-title a',
            'summary': 'div.entry-content p'
        },
        'headers': {
            'User-Agent': USER_AGENT
        }
    },
    'medium': {
        'url': 'https://medium.com/tag/nodejs',
        'selectors': {
            'articles': 'article',
            'title': 'h2',
            'link': 'a[href*="/p/"]',
            'summary': 'div.ae.t'
        },
        'headers': {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        },
        'dynamic': True 
    }
}

def safe_print(text):
    """Imprime texto com tratamento seguro para Unicode"""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('utf-8', errors='replace').decode('ascii', errors='replace'))

def make_request(url, headers=None, max_retries=3):
    """Faz requisições HTTP com tratamento de erros e retentativas"""
    headers = headers or {'User-Agent': USER_AGENT}
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Backoff exponencial

def is_valid_url(url):
    """Verifica se uma URL é válida"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def get_existing_articles(api_url):
    """Obtém artigos existentes da API"""
    try:
        response = make_request(api_url)
        if response.status_code == 200:
            return response.json()
        return []
    except requests.exceptions.RequestException as e:
        safe_print(f"Erro ao buscar artigos existentes: {str(e)}")
        return []

def scrape_articles(source):
    """Realiza o scraping dos artigos de uma fonte específica"""
    config = SOURCES.get(source)
    if not config:
        return {
            'status': 'error',
            'error': 'Fonte inválida',
            'source': source
        }

    try:
        response = make_request(config['url'], config.get('headers'))
        soup = BeautifulSoup(response.text, 'html.parser')
        articles = []

        for post in soup.select(config['selectors']['articles'])[:MAX_ARTICLES]:
            try:
                title_elem = post.select_one(config['selectors']['title'])
                link_elem = post.select_one(config['selectors']['link'])
                summary_elem = post.select_one(config['selectors']['summary'])

                title = title_elem.text.strip() if title_elem else 'Sem título'
                href = link_elem.get('href') if link_elem else None
                link = urljoin(config['url'], href) if href else None
                summary = summary_elem.text.strip() if summary_elem else 'Sem resumo'

                if not is_valid_url(link):
                    continue

                articles.append({
                    'id': str(uuid.uuid4()),
                    'title': title,
                    'summary': summary,
                    'url': link,
                    'source': source,
                    'createdAt': datetime.now().isoformat()
                })
            except Exception as e:
                safe_print(f"Erro ao processar artigo {source}: {str(e)}")
                continue

        return {
            'status': 'success',
            'articles': articles,
            'source': source,
            'count': len(articles)
        }

    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'source': source
        }
def send_to_api(articles, api_url):
    """Envia artigos para a API"""
    if not api_url or not articles:
        return {
            'status': 'skipped',
            'message': 'Nenhum artigo para enviar ou URL da API não fornecida'
        }

    try:
        # Preparar os dados no formato que a API espera
        payload = []
        for article in articles:
            payload.append({
                'title': article['title'],
                'summary': article['summary'],
                'url': article['url'],
                'source': article.get('source', 'devto'),  # Campo adicional
                'createdAt': article.get('createdAt', datetime.now().isoformat())  # Campo adicional
            })

        response = requests.post(
            api_url,
            json=payload,  # Envia como array de objetos
            headers={
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT
            },
            timeout=TIMEOUT
        )
        response.raise_for_status()
        
        return {
            'status': 'success',
            'response': response.json(),
            'articles_sent': len(articles)
        }
    except requests.exceptions.RequestException as e:
        error_msg = f"{e.response.status_code} {e.response.reason} for url: {e.response.url}" if e.response else str(e)
        return {
            'status': 'error',
            'error': error_msg,
            'api_url': api_url,
            'request_payload': payload if 'payload' in locals() else None  # Para debug
        }

def main():
    """Função principal"""
    try:
        if len(sys.argv) < 2:
            result = {
                'status': 'error',
                'error': 'Uso: python scraper.py <fonte> [api_url]',
                'fontes_disponiveis': list(SOURCES.keys())
            }
        else:
            source = sys.argv[1]
            api_url = sys.argv[2] if len(sys.argv) > 2 else None
            
            # Coletar artigos
            scrape_result = scrape_articles(source)
            
            # Se coletou com sucesso e tem API URL, enviar para API
            if scrape_result['status'] == 'success' and api_url:
                # Verificar artigos existentes para evitar duplicatas
                existing_articles = get_existing_articles(api_url)
                existing_urls = {a['url'] for a in existing_articles} if existing_articles else set()
                
                # Filtrar artigos novos
                new_articles = [
                    a for a in scrape_result['articles'] 
                    if a['url'] not in existing_urls
                ]
                
                if new_articles:
                    send_result = send_to_api(new_articles, api_url)
                    scrape_result['api_result'] = send_result
                    scrape_result['new_articles_sent'] = len(new_articles)
                else:
                    scrape_result['api_result'] = {
                        'status': 'skipped',
                        'message': 'Nenhum artigo novo para enviar'
                    }
            
            result = scrape_result

        # Saída formatada
        json_output = json.dumps(result, ensure_ascii=False, indent=2)
        safe_print(json_output)
        
        # Código de saída apropriado
        sys.exit(0 if result.get('status') == 'success' else 1)

    except Exception as e:
        error_result = {
            'status': 'error',
            'error': f"Erro inesperado: {str(e)}",
            'type': type(e).__name__
        }
        safe_print(json.dumps(error_result, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()