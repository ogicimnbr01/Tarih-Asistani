import json
import boto3
import urllib.parse

s3_client = boto3.client('s3')
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TarihProjesiKaynakKutuphanesi")

def lambda_handler(event, context):
    print("Belge İşleyici Lambda tetiklendi!")
    
    try:
        s3_event = event['Records'][0]['s3']
        bucket_name = s3_event['bucket']['name']
        object_key = urllib.parse.unquote_plus(s3_event['object']['key'])
        
        print(f"İşlenecek dosya: {object_key}, Bucket: {bucket_name}")

        parts = object_key.replace('.pdf', '').split('_')
        if len(parts) < 3:
            raise ValueError("Dosya adı formatı yanlış...")
        
        unit_id = parts[0]
        outcome_id = parts[1]
        source_title = " ".join(parts[2:])
        
        source_id = f"{outcome_id}_{source_title.replace(' ', '-')}"
        
        print(f"Ayrıştırılan bilgiler -> Ünite ID: {unit_id}, Kazanım ID: {outcome_id}, Source ID: {source_id}")

        print("Textract çağrılıyor...")
        response = textract_client.detect_document_text(
            Document={'S3Object': {'Bucket': bucket_name, 'Name': object_key}}
        )
        
        extracted_text = ""
        for item in response["Blocks"]:
            if item["BlockType"] == "LINE":
                extracted_text += item["Text"] + "\n"
        
        if not extracted_text:
            raise ValueError("PDF içinden metin çıkarılamadı.")
            
        print("Textract'ten metin başarıyla alındı.")

        print("DynamoDB'ye kayıt ekleniyor...")
        table.put_item(
            Item={
                'unit_id': unit_id,
                'source_id': source_id, # YENİ ANAHTAR
                'outcome_id': outcome_id, # Artık normal bir veri
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