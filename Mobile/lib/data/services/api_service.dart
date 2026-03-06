import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_constants.dart';

class ApiService {
  static final ApiService _instance =
      ApiService._internal();
  late final Dio _dio;

  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: AppConstants.connectTimeout,
        receiveTimeout: AppConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      ),
    );
    _dio.interceptors.add(_AuthInterceptor());
    _dio.interceptors.add(_ErrorInterceptor());
  }

  Dio get client => _dio;
}

class _AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final prefs =
        await SharedPreferences.getInstance();
    final token = prefs.getString(
      AppConstants.prefAuthToken,
    );
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] =
          'Bearer $token';
    }
    handler.next(options);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) {
    final message = _parseErrorMessage(err);
    handler.next(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        error: message,
      ),
    );
  }

  String _parseErrorMessage(DioException err) {
    if (err.response?.data is Map<String, dynamic>) {
      final data =
          err.response!.data as Map<String, dynamic>;
      if (data.containsKey('message')) {
        return data['message'] as String;
      }
    }
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Kết nối quá thời gian. '
            'Vui lòng thử lại.';
      case DioExceptionType.connectionError:
        return 'Không thể kết nối đến máy chủ. '
            'Vui lòng kiểm tra kết nối mạng.';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  }
}
