import json
import boto3
import os

DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME')
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    print("Polling Lambda başladı: İşlemdeki Textract görevleri taranıyor...")
    try:
        response = table.query(
            IndexName='StatusIndex',
            KeyConditionExpression='#st = :status_val',
            ExpressionAttributeNames={
                '#st': 'status' 
            },
            ExpressionAttributeValues={
                ':status_val': 'TEXTRACT_PROCESSING'
            }
        )
        
        items = response.get('Items', [])
        print(f"{len(items)} adet işlemde olan belge bulundu.")
        for item in items:
            job_id = item.get('textract_job_id')
            unit_id = item.get('unit_id')
            source_id = item.get('source_id')
            if not job_id or not unit_id or not source_id:
                print(f"Eksik bilgi: Kayıt atlanıyor - {item}")
                continue
            print(f"Kontrol ediliyor: JobId={job_id}")
            job_result = textract_client.get_document_text_detection(JobId=job_id)
            job_status = job_result.get('JobStatus')
            if job_status == 'SUCCEEDED':
                print(f"BAŞARILI: JobId={job_id}. Metin alınıp veritabanı güncellenecek.")
                full_text = get_full_text_from_textract(job_id)
                table.update_item(
                    Key={'unit_id': unit_id, 'source_id': source_id},
                    UpdateExpression="SET extracted_text = :text, #st = :status_val",
                    ExpressionAttributeNames={'#st': 'status'},
                    ExpressionAttributeValues={':text': full_text, ':status_val': 'COMPLETED'}
                )
                print(f"GÜNCELLENDİ: {source_id}")
            elif job_status == 'FAILED':
                print(f"HATA: JobId={job_id} başarısız oldu.")
                table.update_item(
                    Key={'unit_id': unit_id, 'source_id': source_id},
                    UpdateExpression="SET #st = :status_val",
                    ExpressionAttributeNames={'#st': 'status'},
                    ExpressionAttributeValues={':status_val': 'TEXTRACT_FAILED'}
                )
            else:
                print(f"BEKLEMEDE: JobId={job_id}, Durum: {status}")
    except Exception as e:
        print(f"Kritik Hata: Polling Lambda çalışırken bir sorun oluştu: {str(e)}")
    return {'statusCode': 200, 'body': 'Tarama tamamlandı.'}

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