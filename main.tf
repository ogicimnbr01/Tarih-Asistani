terraform {
  backend "s3" {
    bucket       = "tarih-projesi-tfstate-606705193623"
    key          = "tarih-asistani/terraform.tfstate"
    region       = "eu-central-1"
    encrypt      = true
    use_lockfile = true # S3 native locking (Terraform 1.10+)
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}
provider "aws" {
  region = "eu-central-1"
}

data "aws_caller_identity" "current" {}

locals {
  allowed_origins = [
    "https://www.tarihasistani.com.tr",
    "https://main.d1kvf0euvwd4k5.amplifyapp.com",
    "http://localhost:8000",
    "http://127.0.0.1:5500"
  ]
  bedrock_model_id = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "tarih-projesi-lambda-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}
resource "aws_iam_role_policy" "lambda_policy" {
  name = "tarih-projesi-lambda-policy"
  role = aws_iam_role.lambda_exec_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action   = "bedrock:InvokeModel",
        Effect   = "Allow",
        Resource = [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
          "arn:aws:bedrock:*:${data.aws_caller_identity.current.account_id}:inference-profile/${local.bedrock_model_id}"
        ]
      },
      {
        Action   = ["dynamodb:Query", "dynamodb:GetItem"],
        Effect   = "Allow",
        Resource = [
          aws_dynamodb_table.kaynak_kutuphanesi.arn,
          "${aws_dynamodb_table.kaynak_kutuphanesi.arn}/index/*"
        ]
      }
    ]
  })
}
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_function" 
  output_path = "${path.module}/lambda.zip"      
}
resource "aws_lambda_function" "tarih_projesi_lambda" {
  function_name    = "TarihProjesiCalismaKagidiUretici"
  role             = aws_iam_role.lambda_exec_role.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  timeout          = 60 # Not: API Gateway 30 sn'de keser; pay, doğrudan invoke/teşhis içindir
  memory_size      = 256

  environment {
    variables = {
      BEDROCK_MODEL_ID    = local.bedrock_model_id
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.kaynak_kutuphanesi.name
      ALLOWED_ORIGINS     = join(",", local.allowed_origins)
    }
  }
}                    
resource "aws_apigatewayv2_api" "http_api" {
  name          = "TarihProjesiAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Authorization", "Content-Type", "X-Admin-Key"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"] 
    allow_origins = local.allowed_origins
    max_age       = 300
  }
}
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.tarih_projesi_lambda.invoke_arn
}
resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  # Kötüye kullanıma karşı hız sınırı — Bedrock çağrıları ücretli.
  default_route_settings {
    throttling_rate_limit  = 5
    throttling_burst_limit = 10
  }
}
resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tarih_projesi_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
resource "aws_dynamodb_table" "kaynak_kutuphanesi" {
  name           = "TarihProjesiKaynakKutuphanesi"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "unit_id"
  range_key      = "source_id"

  attribute {
    name = "unit_id"
    type = "S"
  }
  attribute {
    name = "source_id"
    type = "S"
  }
  attribute {
    name = "outcome_id"
    type = "S"
  }

  global_secondary_index {
    name            = "UnitOutcomeIndex"
    hash_key        = "unit_id"
    range_key       = "outcome_id"
    projection_type = "ALL"
  }
}
resource "random_id" "bucket_suffix" {
  byte_length = 8
}
resource "aws_s3_bucket" "belge_deposu" {
  bucket = "tarih-projesi-belge-deposu-${random_id.bucket_suffix.hex}"
}
resource "aws_s3_bucket_public_access_block" "belge_deposu_access_block" {
  bucket = aws_s3_bucket.belge_deposu.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_policy" "belge_deposu_policy" {
  bucket = aws_s3_bucket.belge_deposu.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontOACAccess"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.belge_deposu.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.s3_distribution.arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "belge_deposu_cors" {
  bucket = aws_s3_bucket.belge_deposu.id

cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT"] 
    allowed_origins = local.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "tarih-projesi-oac"
  description                       = "Tarih Projesi S3 Bucket OAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.belge_deposu.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
    origin_id                = "S3-TarihProjesi"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-TarihProjesi"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors_policy.id
    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Header", "Access-Control-Request-Method"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_response_headers_policy" "cors_policy" {
  name    = "tarih-projesi-cors-headers-policy"
  comment = "Tarih Projesi icin CORS Izin Politikasi"
cors_config {
    access_control_allow_credentials = false
    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }
access_control_allow_origins {
      items = local.allowed_origins
    }
    origin_override = true
  }
}

resource "aws_iam_role" "admin_lambda_role" {
  name = "tarih-projesi-admin-lambda-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "admin_lambda_policy" {
  name = "tarih-projesi-admin-lambda-policy"
  role = aws_iam_role.admin_lambda_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action   = ["s3:PutObject", "s3:GetObject"], 
        Effect   = "Allow",
        Resource = "${aws_s3_bucket.belge_deposu.arn}/*"
      },
      {
        Action   = ["dynamodb:PutItem", "dynamodb:UpdateItem"],
        Effect   = "Allow",
        Resource = aws_dynamodb_table.kaynak_kutuphanesi.arn
      },
      {
        Action   = "textract:StartDocumentTextDetection",
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action   = "iam:PassRole",
        Effect   = "Allow",
        Resource = aws_iam_role.textract_sns_role.arn
      },
    ]
  })
}

data "archive_file" "admin_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/admin_lambda"
  output_path = "${path.module}/admin_lambda.zip"
}


resource "aws_lambda_function" "admin_lambda" {
  function_name    = "TarihProjesiAdminFonksiyonu"
  role             = aws_iam_role.admin_lambda_role.arn
  handler          = "admin_handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.admin_lambda_zip.output_path
  source_code_hash = data.archive_file.admin_lambda_zip.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      S3_BUCKET_NAME         = aws_s3_bucket.belge_deposu.id
      DYNAMODB_TABLE_NAME    = aws_dynamodb_table.kaynak_kutuphanesi.name
      ADMIN_API_KEY          = var.admin_api_key
      TEXTRACT_SNS_TOPIC_ARN = aws_sns_topic.textract_notifications.arn
      TEXTRACT_SNS_ROLE_ARN  = aws_iam_role.textract_sns_role.arn
      ALLOWED_ORIGINS        = join(",", local.allowed_origins)
    }
  }
}

resource "aws_apigatewayv2_integration" "admin_lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.admin_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "admin_api_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /admin" 
  target    = "integrations/${aws_apigatewayv2_integration.admin_lambda_integration.id}"
}

resource "aws_lambda_permission" "admin_api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvokeAdmin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# ── Textract tamamlanma bildirimi: SNS -> Result Handler Lambda ──
# Polling yerine Textract iş bitiminde SNS'e mesaj atar; Lambda anında tetiklenir.

resource "aws_sns_topic" "textract_notifications" {
  name = "tarih-projesi-textract-bildirimleri"
}

# Textract'in SNS'e mesaj atabilmesi için üstleneceği rol
resource "aws_iam_role" "textract_sns_role" {
  name = "tarih-projesi-textract-sns-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "textract.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "textract_sns_policy" {
  name = "tarih-projesi-textract-sns-policy"
  role = aws_iam_role.textract_sns_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action   = "sns:Publish",
      Effect   = "Allow",
      Resource = aws_sns_topic.textract_notifications.arn
    }]
  })
}

resource "aws_iam_role" "result_handler_role" {
  name = "tarih-projesi-result-handler-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "result_handler_policy" {
  name = "tarih-projesi-result-handler-policy"
  role = aws_iam_role.result_handler_role.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
        Effect   = "Allow",
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action   = "textract:GetDocumentTextDetection",
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action   = "dynamodb:UpdateItem",
        Effect   = "Allow",
        Resource = aws_dynamodb_table.kaynak_kutuphanesi.arn
      }
    ]
  })
}

data "archive_file" "result_handler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/result_handler_lambda"
  output_path = "${path.module}/result_handler_lambda.zip"
}

resource "aws_lambda_function" "result_handler" {
  function_name    = "TarihProjesiTextractResultHandler"
  role             = aws_iam_role.result_handler_role.arn
  handler          = "result_handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.result_handler_zip.output_path
  source_code_hash = data.archive_file.result_handler_zip.output_base64sha256
  timeout          = 120
  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.kaynak_kutuphanesi.name
    }
  }
}

resource "aws_sns_topic_subscription" "result_handler_subscription" {
  topic_arn = aws_sns_topic.textract_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.result_handler.arn
}

resource "aws_lambda_permission" "allow_sns_to_call_result_handler" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.result_handler.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.textract_notifications.arn
}