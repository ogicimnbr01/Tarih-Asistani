import json
import boto3
import urllib.parse
import time

s3_client = boto3.client('s3')
textract_client = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("TarihProjesiKaynakKutuphanesi")

def get_textract_job_results(job_id):
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
    print("Belge İşleyici Lambda (Akıllı Mod) tetiklendi!")
    
    try:
        s3_event = event['Records'][0]['s3']
        bucket_name = s3_event['bucket']['name']
        object_key = urllib.parse.unquote_plus(s3_event['object']['key'])
        
        print(f"İşlenecek dosya: {object_key}")

        filename_without_extension, extension = object_key.rsplit('.', 1)
        parts = filename_without_extension.split('_')
        
        if len(parts) < 4:
            raise ValueError("Dosya adı formatı yanlış. Beklenen format: 'UniteID_KazanımID_Tur_BelgeAdi.uzantı'")
        
        unit_id, outcome_id, source_type = parts[0], parts[1], parts[2]
        source_title = " ".join(parts[3:])
        source_id = f"{outcome_id}_{source_title.replace(' ', '-')}"
        CLOUDFRONT_DOMAIN = "d2an9xa3x2j0tn.cloudfront.net"
        public_url = f"https://{CLOUDFRONT_DOMAIN}/{object_key}"

        print(f"Ayrıştırılan bilgiler -> Ünite: {unit_id}, Kazanım: {outcome_id}, Tür: {source_type}, Başlık: {source_title}")
        
        extracted_text = "" 

        if extension.lower() == 'pdf':
            print("PDF dosyası algılandı. Textract ile otomatik metin çıkarma başlatılıyor...")
            
            start_response = textract_client.start_document_text_detection(DocumentLocation={'S3Object': {'Bucket': bucket_name, 'Name': object_key}})
            job_id = start_response['JobId']
            print(f"Textract işi başlatıldı. İş Numarası: {job_id}")
            
            while True:
                job_status_response = textract_client.get_document_text_detection(JobId=job_id)
                status = job_status_response['JobStatus']
                print(f"İşin durumu: {status}")
                if status in ['SUCCEEDED', 'FAILED']: break
                time.sleep(5)

            if status == 'FAILED':
                raise ValueError(f"Textract işi başarısız oldu: {job_status_response.get('StatusMessage')}")
            
            extracted_text = get_textract_job_results(job_id)
            print("Metin, Textract tarafından otomatik olarak çıkarıldı.")

        else:
            print("Resim dosyası (gazete vb.) algılandı. Metin alanı manuel giriş için ayarlandı.")
            extracted_text = "Lütfen bu belgenin metnini buraya elle giriniz."

        print("DynamoDB'ye kayıt ekleniyor...")
        table.put_item(
            Item={
                'unit_id': unit_id,
                'source_id': source_id,
                'outcome_id': outcome_id,
                'source_type': source_type,
                'source_title': source_title,
                'extracted_text': extracted_text.strip(),
                'source_url': public_url
            }
        )
        print("Kayıt başarıyla eklendi!")
        
        return {'statusCode': 200, 'body': json.dumps('Belge başarıyla işlendi!')}

    except Exception as e:
        print(f"HATA OLUŞTU: {str(e)}")
        raise e