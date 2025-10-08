import json
import boto3
import urllib.parse
import time

s3_client = boto3.client('s3')
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TarihProjesiKaynakKutuphanesi")

def get_textract_job_results(job_id):
    """
    Textract işi tamamlandığında sonuçları alır.
    Sonuçlar çok uzunsa birden fazla sayfada gelebilir, bu yüzden NextToken kontrolü yapar.
    """
    print(f"{job_id} numaralı işin sonuçları alınıyor...")
    pages = []
    
    response = textract_client.get_document_text_detection(JobId=job_id)
    pages.append(response)
    
    next_token = response.get('NextToken')
    while next_token:
        response = textract_client.get_document_text_detection(JobId=job_id, NextToken=next_token)
        pages.append(response)
        next_token = response.get('NextToken')
        
    extracted_text = ""
    for page in pages:
        for item in page["Blocks"]:
            if item["BlockType"] == "LINE":
                extracted_text += item["Text"] + "\n"
    
    return extracted_text

def lambda_handler(event, context):
    print("Belge İşleyici Lambda (Asenkron Mod) tetiklendi!")
    
    try:
        s3_event = event['Records'][0]['s3']
        bucket_name = s3_event['bucket']['name']
        object_key = urllib.parse.unquote_plus(s3_event['object']['key'])
        
        print(f"İşlenecek dosya: {object_key}, Bucket: {bucket_name}")

        parts = object_key.replace('.pdf', '').split('_')
        if len(parts) < 3:
            raise ValueError("Dosya adı formatı yanlış.")
        
        unit_id, outcome_id = parts[0], parts[1]
        source_title = " ".join(parts[2:])
        source_id = f"{outcome_id}_{source_title.replace(' ', '-')}"
        
        print(f"Ayrıştırılan bilgiler -> Ünite ID: {unit_id}, Kazanım ID: {outcome_id}, Source ID: {source_id}")

        print("Textract'e asenkron iş talebi gönderiliyor...")
        start_response = textract_client.start_document_text_detection(
            DocumentLocation={'S3Object': {'Bucket': bucket_name, 'Name': object_key}}
        )
        job_id = start_response['JobId']
        print(f"İş başarıyla başlatıldı. İş Numarası (JobId): {job_id}")

        while True:
            job_status_response = textract_client.get_document_text_detection(JobId=job_id)
            status = job_status_response['JobStatus']
            print(f"İşin durumu kontrol ediliyor: {status}")
            
            if status in ['SUCCEEDED', 'FAILED']:
                break
            
            time.sleep(5)

        if status == 'FAILED':
            raise ValueError(f"{job_id} numaralı Textract işi başarısız oldu. Hata: {job_status_response.get('StatusMessage')}")

        extracted_text = get_textract_job_results(job_id)
        if not extracted_text:
            raise ValueError("PDF içinden metin çıkarılamadı.")
        print("Textract'ten metin başarıyla alındı.")

        print("DynamoDB'ye kayıt ekleniyor...")
        table.put_item(
            Item={
                'unit_id': unit_id,
                'source_id': source_id,
                'outcome_id': outcome_id,
                'source_title': source_title,
                'extracted_text': extracted_text.strip(),
                'original_pdf_s3_path': f"s3://{bucket_name}/{object_key}"
            }
        )
        print("Kayıt başarıyla eklendi!")
        
        return {'statusCode': 200, 'body': json.dumps('Belge başarıyla işlendi!')}

    except Exception as e:
        print(f"HATA OLUŞTU: {str(e)}")
        raise e