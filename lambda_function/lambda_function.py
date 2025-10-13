import boto3
import json

TABLE_NAME = "TarihProjesiKaynakKutuphanesi"
bedrock = boto3.client(service_name='bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)
model_id = 'anthropic.claude-3-haiku-20240307-v1:0'


CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type',
    'access-control-allow-methods': 'OPTIONS, POST, GET'
}

def lambda_handler(event, context):
    """
    Bu ana fonksiyon, API Gateway'den gelen isteği alır ve görevin türüne göre
    ilgili diğer fonksiyonu (list_sources veya generate_worksheet) çağırır.
    """
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
        error_headers = CORS_HEADERS.copy()
        error_headers['content-type'] = 'application/json; charset=utf-8'
        return {
            'statusCode': 500,
            'headers': error_headers,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }

def list_sources(unit_id, outcome_id):
    """Verilen ünite ve kazanıma ait tüm kaynakları veritabanından sorgular ve listeler."""
    print(f"Kaynaklar listeleniyor: unit_id={unit_id}, outcome_id ile başlayanlar")
    
    response = table.query(
        KeyConditionExpression='unit_id = :uid AND begins_with(source_id, :oid_prefix)',
        ExpressionAttributeValues={
            ':uid': unit_id,
            ':oid_prefix': outcome_id 
        }
    )
    
    items = response.get('Items', [])
    
    sources = [{
        'source_id': item['source_id'], 
        'source_title': item['source_title'],
        'source_type': item.get('source_type', 'Belge'),
        'source_url': item.get('source_url')
    } for item in items]
    
    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps(sources, ensure_ascii=False)
    }

def generate_worksheet(unit_id, source_id):
    """Verilen bir kaynak ID'si için çalışma kağıdı üretir."""
    print(f"Çalışma kağıdı üretiliyor: unit_id={unit_id}, source_id={source_id}")
    
    response = table.get_item(Key={'unit_id': unit_id, 'source_id': source_id})
    
    item = response.get('Item')
    if not item:
        return {
            'statusCode': 404, 
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Belirtilen kaynak bulunamadı.'}, ensure_ascii=False)
        }
    
    tarihi_metin = item.get('extracted_text')
    if not tarihi_metin:
         raise ValueError("Kaynak bulundu fakat metin içeriği boş.")

    prompt = f"""
### GÖREV ###
Sen, MEB müfredatına hakim, modern pedagojik yaklaşımları benimsemiş, uzman bir 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi öğretmenisin. Amacın, aşağıda sunulan birinci elden tarihi kaynağı kullanarak, derste öğrenciler arasında zengin ve çok yönlü bir tartışma ortamı yaratmaktır.

### TALİMATLAR ###
1.  Bu metne dayanarak, Bloom Taksonomisi'nin üst düzey basamaklarına (Analiz, Sentez, Değerlendirme) uygun **3 adet açık uçlu yorum ve analiz sorusu** hazırla.
2.  Sorular, "ne oldu?" diye sormak yerine, "neden olmuş olabilir?", "bu durumun farklı sonuçları ne olabilirdi?", "metnin yazarının asıl amacı ve motivasyonu ne olabilir?", "bu belgedeki ifadeler, dönemin genel zihniyetiyle nasıl bir ilişki içindedir?" gibi daha derin sorgulamalara yöneltmelidir.
3.  Hazırladığın sorular, öğrencileri farklı bakış açıları geliştirmeye ve kendi yorumlarını kanıtlarla desteklemeye teşvik etmelidir.
4.  **Kesinlikle** tek bir doğru cevabı olan veya metinden doğrudan kopyala-yapıştır ile cevaplanabilecek sorulardan kaçın. Çoktan seçmeli soru oluşturma.

### KAYNAK METİN ###
---
{tarihi_metin}
---
"""
    
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
    }

    bedrock_response = bedrock.invoke_model(modelId=model_id, body=json.dumps(request_body))
    response_body = json.loads(bedrock_response['body'].read())
    generated_text = response_body['content'][0]['text']
    
    success_headers = CORS_HEADERS.copy()
    success_headers['content-type'] = 'application/json; charset=utf-8'

    return {
        'statusCode': 200,
        'headers': success_headers,
        'body': json.dumps({
            'calisma_kagidi': generated_text,
            'kullanilan_kaynak': tarihi_metin,
            'source_type': item.get('source_type'),
            'source_url': item.get('source_url')
            }, ensure_ascii=False)
    }