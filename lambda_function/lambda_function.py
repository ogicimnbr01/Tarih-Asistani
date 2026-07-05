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
            return generate_worksheet(body['unit_id'], body['source_id'], origin, body.get('outcome_text'))
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

# Pedagojik motor: modelden serbest metin değil, şemaya uyan yapılandırılmış
# çıktı istenir (Bloom etiketi + gerekçe + cevap anahtarı + rubrik).
WORKSHEET_TOOL = {
    "toolSpec": {
        "name": "calisma_kagidi_olustur",
        "description": "Tarihsel belgeden pedagojik olarak yapılandırılmış çalışma kağıdı üretir.",
        "inputSchema": {"json": {
            "type": "object",
            "properties": {
                "sorular": {
                    "type": "array",
                    "minItems": 4, "maxItems": 4,
                    "items": {
                        "type": "object",
                        "properties": {
                            "soru": {"type": "string", "description": "Öğrenciye sorulacak Türkçe soru cümlesi."},
                            "tur": {"type": "string", "enum": ["icerik", "kaynak_elestirisi"],
                                    "description": "icerik: belgenin içeriğini işleyen soru; kaynak_elestirisi: belgenin kendisini (yazar, amaç, güvenilirlik, bakış açısı) sorgulatan soru."},
                            "bloom_basamagi": {"type": "string",
                                               "enum": ["Hatırlama", "Anlama", "Uygulama", "Analiz", "Değerlendirme", "Yaratma"]},
                            "bloom_gerekcesi": {"type": "string", "description": "Sorunun bu Bloom basamağını neden ölçtüğünün 1-2 cümlelik pedagojik gerekçesi."},
                            "cevap_anahtari": {"type": "string", "description": "Tam puan alan bir cevapta bulunması beklenen unsurlar, madde madde."},
                            "rubrik": {
                                "type": "array", "minItems": 3, "maxItems": 3,
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "seviye": {"type": "string", "description": "Örn: 'Tam (2 puan)', 'Kısmi (1 puan)', 'Yetersiz (0 puan)'"},
                                        "olcut": {"type": "string", "description": "Bu seviyeye karşılık gelen gözlenebilir performans ölçütü."}
                                    },
                                    "required": ["seviye", "olcut"]
                                }
                            }
                        },
                        "required": ["soru", "tur", "bloom_basamagi", "bloom_gerekcesi", "cevap_anahtari", "rubrik"]
                    }
                }
            },
            "required": ["sorular"]
        }}
    }
}

def generate_worksheet(unit_id, source_id, origin='', outcome_text=None):
    print(f"Çalışma kağıdı üretiliyor (pedagojik motor): unit_id={unit_id}, source_id={source_id}")

    response = table.get_item(Key={'unit_id': unit_id, 'source_id': source_id})
    item = response.get('Item')
    if not item:
        return {'statusCode': 404, 'headers': cors_headers(origin), 'body': json.dumps({'message': 'Belirtilen kaynak bulunamadı.'}, ensure_ascii=False)}

    tarihi_metin = item.get('extracted_text')
    if not tarihi_metin:
        raise ValueError("Kaynak bulundu fakat metin içeriği boş.")

    kazanim_bolumu = f"\n### HEDEF KAZANIM ###\nSorular şu MEB kazanımını ölçmelidir: \"{outcome_text}\"\n" if outcome_text else ""

    system_prompt = f"""### KİMLİK ###
Sen, 12. Sınıf T.C. İnkılap Tarihi ve Atatürkçülük dersi için ölçme-değerlendirme uzmanı bir tarih eğitimcisisin. Birinci elden tarihi belgelerle tarihsel düşünme becerisi (kaynak eleştirisi, bağlamlandırma, kanıta dayalı akıl yürütme) kazandırmayı hedeflersin.
{kazanim_bolumu}
### GÖREV ###
Verilen tarihsel belgeden 'calisma_kagidi_olustur' aracını kullanarak TAM 4 soru üret:
1. Bir İÇERİK sorusu alt basamaktan (Anlama): belgedeki bilgiyi kendi cümleleriyle açıklamayı gerektirir.
2. Bir İÇERİK sorusu orta basamaktan (Analiz): belgedeki bilgiler arasında ilişki kurmayı, neden-sonuç çözümlemeyi gerektirir.
3. Bir İÇERİK sorusu üst basamaktan (Değerlendirme veya Yaratma): yargıda bulunmayı, savunmayı veya özgün çıkarım üretmeyi gerektirir.
4. Bir KAYNAK ELEŞTİRİSİ sorusu: belgenin KENDİSİNİ sorgulatır — kim, ne zaman, hangi amaçla, hangi bakış açısıyla yazmış; neyi söylemiyor; ne kadar güvenilir? Bu soru öğrenciye tarihçi gibi düşünmeyi öğretir.

### KURALLAR ###
- Tüm metinler Türkçe ve dil bilgisi açısından kusursuz olmalıdır.
- Sorular yalnızca verilen belgeden hareketle cevaplanabilir olmalı; belgede olmayan bilgiyi ezber yoklamak için sorma.
- KISA YAZ: bloom_gerekcesi tek cümle; cevap_anahtari en fazla 3 kısa madde; her rubrik ölçütü tek cümle. Uzun paragraf yazma.
- Cevap anahtarı, öğretmenin puanlarken arayacağı somut unsurları maddeler.
- Rubrik seviyeleri gözlenebilir performans ölçütleriyle yazılır; 'iyi cevap' gibi belirsiz ifadeler kullanılmaz.
- Rubrik seviye adları her zaman: 'Tam (2 puan)', 'Kısmi (1 puan)', 'Yetersiz (0 puan)'."""

    user_message = {
        "role": "user",
        "content": [{"text": f"### KAYNAK BELGE ###\n---\n{tarihi_metin}\n---\nBu belge için çalışma kağıdını üret."}]
    }

    bedrock_response = bedrock.converse(
        modelId=model_id,
        messages=[user_message],
        system=[{"text": system_prompt}],
        toolConfig={"tools": [WORKSHEET_TOOL], "toolChoice": {"tool": {"name": "calisma_kagidi_olustur"}}},
        inferenceConfig={"maxTokens": 4096}
    )

    tool_input = None
    for block in bedrock_response['output']['message']['content']:
        if 'toolUse' in block:
            tool_input = block['toolUse']['input']
            break
    if not tool_input or not tool_input.get('sorular'):
        raise ValueError("Model beklenen yapılandırılmış çıktıyı üretmedi.")

    sorular = tool_input['sorular']
    # Eski istemcilerle geriye dönük uyumluluk: düz metin alanı korunur.
    calisma_kagidi = "\n".join(s['soru'] for s in sorular)

    success_headers = cors_headers(origin); success_headers['content-type'] = 'application/json; charset=utf-8'
    return {
        'statusCode': 200,
        'headers': success_headers,
        'body': json.dumps({
            'calisma_kagidi': calisma_kagidi,
            'sorular': sorular,
            'kullanilan_kaynak': tarihi_metin,
            'source_type': item.get('source_type'),
            'source_url': item.get('source_url'),
            'source_citation': item.get('source_citation')
            }, ensure_ascii=False)
    }