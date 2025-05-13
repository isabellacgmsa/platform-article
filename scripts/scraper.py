#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin
import uuid
from datetime import datetime
import io
import sys

# Configuração para forçar UTF-8 no Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configurações
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
TIMEOUT = 15

# Configuração das fontes
SOURCES = {
    'devto': {
        'url': 'https://dev.to/t/node',
        'selectors': {
            'articles': 'div.crayons-story',
            'title': 'h2 a',
            'link': 'h2 a',
            'summary': 'div.crayons-story__teaser'
        }
    },
    'hashnode': {
        'url': 'https://hashnode.com/n/nodejs',
        'selectors': {
            'articles': 'div[class*="blog-article-card"]',
            'title': 'h3 a',
            'link': 'h3 a',
            'summary': 'p[class*="excerpt"]'
        }
    },
    'medium': {
        'url': 'https://medium.com/tag/nodejs',
        'selectors': {
            'articles': 'article',
            'title': 'h2',
            'link': 'a[href*="/p/"]',
            'summary': 'p'
        }
    }
}

def safe_print(text):
    """Imprime texto com tratamento seguro para Unicode"""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('utf-8', errors='replace').decode('ascii', errors='replace'))

def make_request(url, max_retries=3):
    """Faz requisições HTTP com tratamento de erros"""
    for attempt in range(max_retries):
        try:
            response = requests.get(
                url,
                headers={'User-Agent': USER_AGENT},
                timeout=TIMEOUT
            )
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Backoff exponencial

def scrape_articles(source, api_url):
    """Realiza o scraping dos artigos"""
    config = SOURCES.get(source)
    if not config:
        return {
            'status': 'error',
            'error': 'Fonte inválida',
            'source': source
        }

    try:
        response = make_request(config['url'])
        soup = BeautifulSoup(response.text, 'html.parser')
        articles = []
        
        for post in soup.select(config['selectors']['articles'])[:5]:
            try:
                title_elem = post.select_one(config['selectors']['title'])
                link_elem = post.select_one(config['selectors']['link'])
                summary_elem = post.select_one(config['selectors']['summary'])
                
                title = title_elem.text.strip() if title_elem else 'Sem título'
                link = urljoin(config['url'], link_elem['href']) if link_elem else '#'
                summary = summary_elem.text.strip() if summary_elem else 'Sem resumo'
                
                articles.append({
                    'id': str(uuid.uuid4()),
                    'title': title,
                    'summary': summary,
                    'url': link,
                    'source': source,
                    'createdAt': datetime.now().isoformat()
                })
            except Exception as e:
                safe_print(f"Erro ao processar artigo: {str(e)}")
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

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            result = {
                'status': 'error',
                'error': 'Uso: python scraper.py <fonte> <api_url>'
            }
        else:
            result = scrape_articles(sys.argv[1], sys.argv[2])
        
        # Saída JSON segura para Unicode
        json_output = json.dumps(result, ensure_ascii=False, indent=2)
        safe_print(json_output)
        sys.exit(0 if result['status'] == 'success' else 1)
    
    except Exception as e:
        error_result = {
            'status': 'error',
            'error': f"Erro inesperado: {str(e)}"
        }
        safe_print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)