import boto3
import json
import os

TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'TarihProjesiKaynakKutuphanesi')
bedrock = boto3.client(service_name='bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

model_id = os.environ.get('BEDROCK_MODEL_ID', 'eu.anthropic.claude-haiku-4-5-20251001-v1:0')
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('ALLOWED_ORIGINS', '').split(',') if o.strip()]

def cors_headers(origin=''):
    # Sadece izinli origin'lere CORS başlığı dön; '*' kullanma.
    allow_origin = origin if origin in ALLOWED_ORIGINS else (ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else 'null')
    return {
        'access-control-allow-origin': allow_origin,
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'OPTIONS, POST, GET',
        'vary': 'Origin'
    }

def lambda_handler(event, context):
    headers = event.get('headers', {})
    origin = headers.get('origin') or headers.get('Origin') or ''

    # HTTP API v2 payload: metod requestContext.http.method altında gelir.
    http_method = event.get('requestContext', {}).get('http', {}).get('method', '') or event.get('httpMethod', '')
    if http_method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(origin)}
    try:
        body = json.loads(event.get("body", "{}") or "{}")
        if 'source_id' in body and 'unit_id' in body:
            return generate_worksheet(body['unit_id'], body['source_id'], origin)
        elif 'unit_id' in body and 'outcome_id' in body:
            return list_sources(body['unit_id'], body['outcome_id'], origin)
        else:
            raise ValueError("İstek için gerekli parametreler eksik.")
    except Exception as e:
        print(f"HATA: {str(e)}")
        error_headers = cors_headers(origin); error_headers['content-type'] = 'application/json; charset=utf-8'
        return {'statusCode': 500, 'headers': error_headers, 'body': json.dumps({'error': str(e)}, ensure_ascii=False)}

def list_sources(unit_id, outcome_id, origin=''):
    print(f"Kaynaklar listeleniyor: unit_id={unit_id}, outcome_id={outcome_id}")
    response = table.query(IndexName='UnitOutcomeIndex', KeyConditionExpression='unit_id = :uid AND outcome_id = :oid', ExpressionAttributeValues={':uid': unit_id, ':oid': outcome_id})
    items = response.get('Items', []); print(f"{len(items)} adet kaynak bulundu.")
    sources = [{'source_id': item['source_id'], 'source_title': item['source_title'], 'source_type': item.get('source_type', 'Belge'), 'source_url': item.get('source_url')} for item in items]
    return {'statusCode': 200, 'headers': cors_headers(origin), 'body': json.dumps(sources, ensure_ascii=False)}

def generate_worksheet(unit_id, source_id, origin=''):
    print(f"Çalışma kağıdı üretiliyor (Converse API ile): unit_id={unit_id}, source_id={source_id}")
    
    response = table.get_item(Key={'unit_id': unit_id, 'source_id': source_id})
    item = response.get('Item')
    if not item:
        return {'statusCode': 404, 'headers': cors_headers(origin), 'body': json.dumps({'message': 'Belirtilen kaynak bulunamadı.'}, ensure_ascii=False)}
    
    tarihi_metin = item.get('extracted_text')
    if not tarihi_metin:
        raise ValueError("Kaynak bulundu fakat metin içeriği boş.")

    system_prompt = """### KİMLİK ###
Sen, sadece istenen formatta ve Türkçe cevap üreten, uzman bir 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi öğretmenisin.

### KURALLAR ###
1. **En Önemli Kural:** Çıktın, başka HİÇBİR kelime, başlık, açıklama, numara, madde işareti veya İngilizce "düşünme süreci" metni içermemelidir. Sadece ve sadece 3 adet Türkçe soru cümlesi olmalıdır.
2. **Soru Yapısı:** Sorular, Bloom Taksonomisi'nin farklı basamaklarını yansıtacak şekilde dengeli olmalıdır.
3. **Çıktı Formatı:** Her soru ayrı bir satırda olmalıdır.

### ÖRNEK ÇIKTI ###
Sevr Antlaşması'nın imzalanması, Osmanlı Devleti'nin egemenlik haklarını nasıl etkilemiştir?
İstanbul Hükûmeti'nin Sevr Antlaşması'nı imzalamasının ardındaki siyasi ve sosyal baskılar neler olabilir?
Sevr Antlaşması'nın tamamen uygulanması durumunda günümüz Türkiye haritası ve siyasi yapısı nasıl şekillenirdi?
"""
    
    user_message = {
        "role": "user",
        "content": [{ "text": f"### GÖREV ###\nYukarıdaki kimliğe bürün, tüm kurallara ve örneğe harfiyen uyarak, şimdi sana verilecek olan aşağıdaki Kaynak Metin için istenen formatta 3 soru oluştur.\n---\n{tarihi_metin}\n---"}]
    }
    
    bedrock_response = bedrock.converse(
        modelId=model_id,
        messages=[user_message],
        system=[{"text": system_prompt}],
        inferenceConfig={"maxTokens": 2048}
    )
    
    output_message = bedrock_response['output']['message']
    generated_text = output_message['content'][0]['text']
    
    success_headers = cors_headers(origin); success_headers['content-type'] = 'application/json; charset=utf-8'
    return {
        'statusCode': 200,
        'headers': success_headers,
        'body': json.dumps({
            'calisma_kagidi': generated_text.strip(),
            'kullanilan_kaynak': tarihi_metin,
            'source_type': item.get('source_type'),
            'source_url': item.get('source_url'),
            'source_citation': item.get('source_citation')
            }, ensure_ascii=False)
    }