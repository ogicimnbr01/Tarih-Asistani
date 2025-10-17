import json
import boto3
import uuid
import os
from urllib.parse import urlparse

S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME') 
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')

s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
textract_client = boto3.client('textract')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        mode = body.get('mode')

        if mode == 'get_upload_url':
            return handle_get_upload_url(body)
        elif mode == 'save_metadata':
            return handle_save_metadata_and_start_textract(body)
        else:
            return create_response(400, {'error': 'Geçersiz mod belirtildi.'})
    except Exception as e:
        print(f"Beklenmedik bir hata oluştu: {str(e)}")
        return create_response(500, {'error': f'Sunucu hatası: {str(e)}'})

def handle_get_upload_url(body):
    extension = body.get('extension')
    content_type = body.get('contentType')
    if not extension or not content_type:
        return create_response(400, {'error': 'Eksik parametreler.'})

    object_key = f"uploads/{uuid.uuid4()}.{extension}"
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={'Bucket': S3_BUCKET_NAME, 'Key': object_key, 'ContentType': content_type},
        ExpiresIn=3600
    )
    return create_response(200, {'upload_url': presigned_url, 'object_key': object_key})

def handle_save_metadata_and_start_textract(body):
    metadata = body.get('metadata')
    if not metadata:
        return create_response(400, {'error': 'Metadata eksik.'})

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
        
        response = textract_client.start_document_text_detection(
            DocumentLocation={'S3Object': {'Bucket': S3_BUCKET_NAME, 'Name': object_key}}
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

    return create_response(200, {'message': 'Belge başarıyla kaydedildi ve işlemeye alındı.'})

def create_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body)
    }