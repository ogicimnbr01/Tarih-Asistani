terraform {
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
        Resource = "*"
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
  timeout          = 30
}                       
resource "aws_apigatewayv2_api" "http_api" {
  name          = "TarihProjesiAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Authorization", "Content-Type"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"] 
    allow_origins = [
      "https://www.tarihasistani.com.tr", 
      "https://main.d30pkxbqbjkexa.amplifyapp.com", 
      "http://localhost:8000",
      "http://127.0.0.1:5500"
    ]
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
    name = "status"
    type = "S"
  }
  attribute {
    name = "outcome_id"
    type = "S"
  }

  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    projection_type = "ALL"
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
resource "aws_iam_role" "belge_isleyici_lambda_role" {
  name = "tarih-projesi-belge-isleyici-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}
resource "aws_iam_role_policy" "belge_isleyici_lambda_policy" {
  name = "tarih-projesi-belge-isleyici-policy"
  role = aws_iam_role.belge_isleyici_lambda_role.id
policy = jsonencode({
  Version   = "2012-10-17",
  Statement = [
    {
      Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      Effect   = "Allow",
      Resource = "arn:aws:logs:*:*:*"
    },
    {
      Action   = "s3:GetObject",
      Effect   = "Allow",
      Resource = "${aws_s3_bucket.belge_deposu.arn}/*"
    },
    {
      Action   = [
          "textract:StartDocumentTextDetection",
          "textract:GetDocumentTextDetection"
      ],
      Effect   = "Allow",
      Resource = "*"
    },
    {
      Action   = "dynamodb:PutItem",
      Effect   = "Allow",
      Resource = aws_dynamodb_table.kaynak_kutuphanesi.arn
    }
  ]
})
}
data "archive_file" "belge_isleyici_zip" {
  type        = "zip"
  source_dir  = "${path.module}/belge_isleyici_lambda"
  output_path = "${path.module}/belge_isleyici.zip"
}
resource "aws_lambda_function" "belge_isleyici_lambda" {
  function_name    = "TarihProjesiBelgeIsleyici"
  role             = aws_iam_role.belge_isleyici_lambda_role.arn
  handler          = "belge_isleyici.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.belge_isleyici_zip.output_path
  source_code_hash = data.archive_file.belge_isleyici_zip.output_base64sha256
  timeout          = 300
}
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.belge_deposu.id
  depends_on = [aws_lambda_permission.allow_s3_to_call_lambda]

  lambda_function {
    lambda_function_arn = aws_lambda_function.belge_isleyici_lambda.arn
    events              = ["s3:ObjectCreated:*"]
  }
}
resource "aws_lambda_permission" "allow_s3_to_call_lambda" {
  statement_id  = "AllowS3ToInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.belge_isleyici_lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.belge_deposu.arn
}

resource "aws_s3_bucket_cors_configuration" "belge_deposu_cors" {
  bucket = aws_s3_bucket.belge_deposu.id

cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT"] 
    allowed_origins = [
        "https://main.d30pkxbqbjkexa.amplifyapp.com",
        "https://www.tarihasistani.com.tr",
        "http://localhost:8000",
        "http://127.0.0.1:5500"
    ]
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

data "aws_iam_policy_document" "s3_policy_for_cloudfront" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.belge_deposu.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
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
      items = [
        "https://main.d30pkxbqbjkexa.amplifyapp.com", 
        "https://www.tarihasistani.com.tr", 
        "http://localhost:8000", 
        "http://127.0.0.1:5500"
      ]
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
        Action   = [
            "textract:StartDocumentTextDetection",
            "textract:GetDocumentTextDetection"
        ],
        Effect   = "Allow",
        Resource = "*"
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
      S3_BUCKET_NAME      = aws_s3_bucket.belge_deposu.id
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.kaynak_kutuphanesi.name
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

resource "aws_iam_role" "polling_lambda_role" {
  name = "tarih-projesi-polling-lambda-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "polling_lambda_policy" {
  name = "tarih-projesi-polling-lambda-policy"
  role = aws_iam_role.polling_lambda_role.id
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
        Action   = ["dynamodb:UpdateItem", "dynamodb:Query"],
        Effect   = "Allow",
        Resource = [
          aws_dynamodb_table.kaynak_kutuphanesi.arn,
          "${aws_dynamodb_table.kaynak_kutuphanesi.arn}/index/*"
        ]
      }
    ]
  })
}

data "archive_file" "polling_lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/polling_lambda" 
  output_path = "${path.module}/polling_lambda.zip"
}

resource "aws_lambda_function" "polling_lambda" {
  function_name    = "TarihProjesiPollingHandler"
  role             = aws_iam_role.polling_lambda_role.arn
  handler          = "polling_handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.polling_lambda_zip.output_path
  source_code_hash = data.archive_file.polling_lambda_zip.output_base64sha256
  timeout          = 120 
  environment {
    variables = {
      DYNAMODB_TABLE_NAME = aws_dynamodb_table.kaynak_kutuphanesi.name
    }
  }
}

resource "aws_cloudwatch_event_rule" "lambda_scheduler" {
  name                = "HerIkiDakikadaBir"
  description         = "TarihProjesiPollingHandler'ı tetikler"
  schedule_expression = "rate(2 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.lambda_scheduler.name
  arn       = aws_lambda_function.polling_lambda.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id  = "AllowCloudwatchInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.polling_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.lambda_scheduler.arn
}