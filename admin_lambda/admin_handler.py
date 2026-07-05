import json
import boto3
import uuid
import os
import hmac
from urllib.parse import urlparse

S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')
TEXTRACT_SNS_TOPIC_ARN = os.environ.get('TEXTRACT_SNS_TOPIC_ARN')
TEXTRACT_SNS_ROLE_ARN = os.environ.get('TEXTRACT_SNS_ROLE_ARN')
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get('ALLOWED_ORIGINS', '').split(',') if o.strip()]

s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
textract_client = boto3.client('textract')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    headers = event.get('headers', {})
    origin = headers.get('origin') or headers.get('Origin') or ''

    # OPTIONS preflight isteğini hemen yanıtla (CORS için gerekli)
    http_method = event.get('requestContext', {}).get('http', {}).get('method', '')
    if http_method == 'OPTIONS' or event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {'message': 'OK'}, origin)

    # API Key kontrolü (sabit zamanlı karşılaştırma — timing attack'e karşı)
    api_key = headers.get('x-admin-key') or headers.get('X-Admin-Key') or ''
    expected_key = os.environ.get('ADMIN_API_KEY') or ''

    if not expected_key or not hmac.compare_digest(api_key, expected_key):
        return create_response(401, {'error': 'Yetkisiz erişim. Geçerli API anahtarı gerekli.'}, origin)
    
    try:
        body = json.loads(event.get('body', '{}'))
        mode = body.get('mode')

        if mode == 'get_upload_url':
            return handle_get_upload_url(body, origin)
        elif mode == 'save_metadata':
            return handle_save_metadata_and_start_textract(body, origin)
        elif mode == 'verify':
            return create_response(200, {'verified': True, 'message': 'Şifre doğrulandı'}, origin)
        else:
            return create_response(400, {'error': 'Geçersiz mod belirtildi.'}, origin)
    except Exception as e:
        print(f"Beklenmedik bir hata oluştu: {str(e)}")
        return create_response(500, {'error': f'Sunucu hatası: {str(e)}'}, origin)

def handle_get_upload_url(body, origin=''):
    extension = body.get('extension')
    content_type = body.get('contentType')
    if not extension or not content_type:
        return create_response(400, {'error': 'Eksik parametreler.'}, origin)

    object_key = f"uploads/{uuid.uuid4()}.{extension}"
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={'Bucket': S3_BUCKET_NAME, 'Key': object_key, 'ContentType': content_type},
        ExpiresIn=3600
    )
    return create_response(200, {'upload_url': presigned_url, 'object_key': object_key}, origin)

def handle_save_metadata_and_start_textract(body, origin=''):
    metadata = body.get('metadata')
    if not metadata:
        return create_response(400, {'error': 'Metadata eksik.'}, origin)

    source_url = metadata.get('source_url')
    parsed_url = urlparse(source_url)
    object_key = parsed_url.path.lstrip('/')
    unit_id = metadata.get('unit_id')

    item_to_save = {
        'unit_id': unit_id,
        'source_id': object_key,
        'outcome_id': metadata.get('outcome_id'),
        'source_type': metadata.get('source_type'),
        'source_title': metadata.get('source_title'),
        'source_url': source_url,
        'source_citation': metadata.get('source_citation'),
        'extracted_text': metadata.get('extracted_text'),
        'status': 'METADATA_SAVED'
    }
    table.put_item(Item=item_to_save)
    print(f"Metadata DynamoDB'ye kaydedildi: {object_key}")

    if not metadata.get('extracted_text') and object_key.lower().endswith('.pdf'):
        print(f"Textract işlemi başlatılıyor: {object_key}")

        # İş bittiğinde SNS -> result handler Lambda tetiklenir (polling yok).
        # JobTag'e unit_id yazılır; source_id zaten S3 nesne anahtarıdır.
        response = textract_client.start_document_text_detection(
            DocumentLocation={'S3Object': {'Bucket': S3_BUCKET_NAME, 'Name': object_key}},
            NotificationChannel={'SNSTopicArn': TEXTRACT_SNS_TOPIC_ARN, 'RoleArn': TEXTRACT_SNS_ROLE_ARN},
            JobTag=unit_id
        )
        job_id = response['JobId']
        print(f"Textract görevi başlatıldı. Job ID: {job_id}")

        table.update_item(
            Key={'unit_id': unit_id, 'source_id': object_key},
            UpdateExpression="SET textract_job_id = :jobId, #st = :status",
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={':jobId': job_id, ':status': 'TEXTRACT_PROCESSING'}
        )
    else:
        print("Textract işlemi atlandı.")
        table.update_item(
            Key={'unit_id': unit_id, 'source_id': object_key},
            UpdateExpression="SET #st = :status",
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={':status': 'COMPLETED_MANUAL_TEXT'}
        )

    return create_response(200, {'message': 'Belge başarıyla kaydedildi ve işlemeye alındı.'}, origin)

def create_response(status_code, body, origin=''):
    # Sadece izinli origin'lere CORS başlığı dön; '*' kullanma.
    allow_origin = origin if origin in ALLOWED_ORIGINS else (ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else 'null')
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': allow_origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Vary': 'Origin'
        },
        'body': json.dumps(body, ensure_ascii=False)
    }