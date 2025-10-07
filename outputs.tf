output "api_endpoint_url" {
  description = "Çalışma kağıdı üretmek için kullanılacak API URL'i"
  value       = aws_apigatewayv2_stage.api_stage.invoke_url
}