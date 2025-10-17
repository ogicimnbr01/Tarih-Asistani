import json
import boto3
import os
import uuid

s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
BUCKET_NAME = os.environ['S3_BUCKET_NAME']
TABLE_NAME = os.environ['DYNAMODB_TABLE_NAME']
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS, POST'
}

def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS}

    try:
        body = json.loads(event.get("body", "{}"))
        mode = body.get('mode')

        if mode == 'get_upload_url':
            extension = body.get('extension', 'jpg')
            object_key = f"{uuid.uuid4()}.{extension}"
            
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={'Bucket': BUCKET_NAME, 'Key': object_key, 'ContentType': body.get('contentType')},
                ExpiresIn=300  
            )
            return response(200, {'upload_url': presigned_url, 'object_key': object_key})

elif mode == 'save_metadata':
            metadata = body.get('metadata', {})
            
            unit_id = metadata.get('unit_id')
            outcome_id = metadata.get('outcome_id')
            source_title = metadata.get('source_title')
            source_citation = metadata.get('source_citation')
            
            if not all([unit_id, outcome_id, source_title]):
                raise ValueError("Eksik metadata bilgileri.")

            source_id = f"{outcome_id}_{source_title.replace(' ', '-')}"
            
            item_attributes = {
                'unit_id': unit_id,
                'source_id': source_id,
                'outcome_id': outcome_id,
                'source_type': metadata.get('source_type'),
                'source_title': source_title,
                'extracted_text': metadata.get('extracted_text'),
                'source_url': metadata.get('source_url')
            }
            
            if source_citation:
                item_attributes['source_citation'] = source_citation

            table.put_item(
                Item=item_attributes
            )
            return response(200, {'message': 'Belge başarıyla kütüphaneye eklendi!'})

        else:
            raise ValueError("Geçersiz mod belirtildi.")

    except Exception as e:
        return response(500, {'error': str(e)})

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(body, ensure_ascii=False)
    }