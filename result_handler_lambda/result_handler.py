import json
import boto3
import os

DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def lambda_handler(event, context):
    # Textract, iş bittiğinde SNS üzerinden bu fonksiyonu tetikler.
    for record in event.get('Records', []):
        message = json.loads(record['Sns']['Message'])
        job_id = message['JobId']
        job_status = message['Status']
        # JobTag'e unit_id yazıyoruz, source_id S3 nesne anahtarının kendisi.
        unit_id = message.get('JobTag')
        source_id = message.get('DocumentLocation', {}).get('S3ObjectName')

        if not unit_id or not source_id:
            print(f"Eksik bilgi, kayıt atlanıyor: JobId={job_id}, JobTag={unit_id}, S3ObjectName={source_id}")
            continue

        print(f"Textract sonucu alındı: JobId={job_id}, Durum={job_status}")

        if job_status == 'SUCCEEDED':
            full_text = get_full_text_from_textract(job_id)
            table.update_item(
                Key={'unit_id': unit_id, 'source_id': source_id},
                UpdateExpression="SET extracted_text = :text, #st = :status_val",
                ExpressionAttributeNames={'#st': 'status'},
                ExpressionAttributeValues={':text': full_text, ':status_val': 'COMPLETED'}
            )
            print(f"GÜNCELLENDİ: {source_id}")
        else:
            table.update_item(
                Key={'unit_id': unit_id, 'source_id': source_id},
                UpdateExpression="SET #st = :status_val",
                ExpressionAttributeNames={'#st': 'status'},
                ExpressionAttributeValues={':status_val': 'TEXTRACT_FAILED'}
            )
            print(f"HATA: JobId={job_id} başarısız oldu.")

    return {'statusCode': 200}


def get_full_text_from_textract(job_id):
    full_text = ""
    next_token = None
    while True:
        params = {'JobId': job_id}
        if next_token:
            params['NextToken'] = next_token
        response = textract_client.get_document_text_detection(**params)
        for block in response.get('Blocks', []):
            if block.get('BlockType') == 'LINE':
                full_text += block.get('Text', '') + '\n'
        next_token = response.get('NextToken')
        if not next_token:
            break
    return full_text
