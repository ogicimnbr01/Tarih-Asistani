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
        Resource = aws_dynamodb_table.kaynak_kutuphanesi.arn
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
}
resource "random_id" "bucket_suffix" {
  byte_length = 8
}
resource "aws_s3_bucket" "belge_deposu" {
  bucket = "tarih-projesi-belge-deposu-${random_id.bucket_suffix.hex}"
}
resource "aws_s3_bucket_public_access_block" "belge_deposu_access_block" {
  bucket = aws_s3_bucket.belge_deposu.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
resource "aws_s3_bucket_policy" "belge_deposu_policy" {
  bucket = aws_s3_bucket.belge_deposu.id
  depends_on = [aws_s3_bucket_public_access_block.belge_deposu_access_block]
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = "*",
      Action    = "s3:GetObject",
      Resource  = ["${aws_s3_bucket.belge_deposu.arn}/*"]
    }]
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