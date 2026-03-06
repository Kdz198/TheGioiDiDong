// Auto-generated Dart API clients and models are written to lib/generated/.
// Do NOT edit files inside lib/generated/ — they are regenerated from the
// backend OpenAPI specs whenever you run:
//
//   dart run build_runner build --delete-conflicting-outputs
//
// To point at a different spec, change inputSpecFile below.
// For local/staging development, replace the URL with a staging endpoint or
// a local file path (e.g. 'assets/api-spec.json').

import 'package:openapi_generator_annotations/openapi_generator_annotations.dart';

@Openapi(
  additionalProperties: DioProperties(
    pubName: 'mss301_orders_api',
    pubAuthor: 'mss301',
  ),
  inputSpecFile: 'https://tgdd-api.kdz.asia/api/orders/v3/api-docs',
  generatorName: Generator.dartDio,
  outputDirectory: 'lib/generated/orders',
)
class OrdersOpenApiConfig extends OpenapiGeneratorConfig {}

@Openapi(
  additionalProperties: DioProperties(
    pubName: 'mss301_products_api',
    pubAuthor: 'mss301',
  ),
  inputSpecFile: 'https://tgdd-api.kdz.asia/api/products/v3/api-docs',
  generatorName: Generator.dartDio,
  outputDirectory: 'lib/generated/products',
)
class ProductsOpenApiConfig extends OpenapiGeneratorConfig {}

@Openapi(
  additionalProperties: DioProperties(
    pubName: 'mss301_users_api',
    pubAuthor: 'mss301',
  ),
  inputSpecFile: 'https://tgdd-api.kdz.asia/api/users/v3/api-docs',
  generatorName: Generator.dartDio,
  outputDirectory: 'lib/generated/users',
)
class UsersOpenApiConfig extends OpenapiGeneratorConfig {}
