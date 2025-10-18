import boto3
import json
import os

TABLE_NAME = "TarihProjesiKaynakKutuphanesi"
bedrock = boto3.client(service_name='bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

model_id = 'arn:aws:bedrock:eu-central-1:***REMOVED***:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0'

CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type',
    'access-control-allow-methods': 'OPTIONS, POST, GET'
}

def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS}
    try:
        body = json.loads(event.get("body", "{}") or "{}")
        if 'source_id' in body and 'unit_id' in body:
            return generate_worksheet(body['unit_id'], body['source_id'])
        elif 'unit_id' in body and 'outcome_id' in body:
            return list_sources(body['unit_id'], body['outcome_id'])
        else:
            raise ValueError("İstek için gerekli parametreler eksik.")
    except Exception as e:
        print(f"HATA: {str(e)}")
        error_headers = CORS_HEADERS.copy(); error_headers['content-type'] = 'application/json; charset=utf-8'
        return {'statusCode': 500, 'headers': error_headers, 'body': json.dumps({'error': str(e)}, ensure_ascii=False)}

def list_sources(unit_id, outcome_id):
    print(f"Kaynaklar listeleniyor: unit_id={unit_id}, outcome_id={outcome_id}")
    response = table.query(IndexName='UnitOutcomeIndex', KeyConditionExpression='unit_id = :uid AND outcome_id = :oid', ExpressionAttributeValues={':uid': unit_id, ':oid': outcome_id})
    items = response.get('Items', []); print(f"{len(items)} adet kaynak bulundu.")
    sources = [{'source_id': item['source_id'], 'source_title': item['source_title'], 'source_type': item.get('source_type', 'Belge'), 'source_url': item.get('source_url')} for item in items]
    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(sources, ensure_ascii=False)}

def generate_worksheet(unit_id, source_id):
    print(f"Çalışma kağıdı üretiliyor (Converse API ile): unit_id={unit_id}, source_id={source_id}")
    
    response = table.get_item(Key={'unit_id': unit_id, 'source_id': source_id})
    item = response.get('Item')
    if not item:
        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'message': 'Belirtilen kaynak bulunamadı.'})}
    
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
    
    success_headers = CORS_HEADERS.copy(); success_headers['content-type'] = 'application/json; charset=utf-8'
    return {
        'statusCode': 200,
        'headers': success_headers,
        'body': json.dumps({
            'calisma_kagidi': generated_text.strip(),
            'kullanilan_kaynak': tarihi_metin,
            'source_type': item.get('source_type'),
            'source_url': item.get('source_url')
            'source_citation': item.get('source_citation')
            }, ensure_ascii=False)
    }