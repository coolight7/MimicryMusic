// ignore_for_file: file_names, camel_case_types, constant_identifier_names
import 'dart:io';
import 'dart:convert' as convert;
import 'package:flutter/foundation.dart';
import 'package:logging/logging.dart';
import 'package:mymusic/store/SrcStore.dart';
import 'package:path_provider/path_provider.dart';

class _MyLogPath_e {
  static const Error = "/${MySrcTemporaryPath_e.BasePath}/log/error.log",
      Info = "/${MySrcTemporaryPath_e.BasePath}/log/info.log";
}

class MyLogger {
  static const String tag = "\r\n\r\n----MimicryMusic----\r\n\r\n";
  static final _instance = MyLogger(className: "Global");
  // 日志文件大小限制
  static const int fileSizeLimit = 1024 * 1024 * 7;

  static late final File errLogFile, infoLogFile;

  final Logger _log;
  final String className;

  MyLogger({
    required this.className,
  }) : _log = Logger(className);

  static MyLogger to() => _instance;

  static Future<void> initDo() async {
    if (kDebugMode) {
      // 开发日志
      Logger.root.level = Level.ALL; // defaults to Level.INFO
    } else {
      // 生产日志
      Logger.root.level = Level.CONFIG;
    }
    final dir = await getApplicationDocumentsDirectory();
    errLogFile = File(dir.path + _MyLogPath_e.Error);
    infoLogFile = File(dir.path + _MyLogPath_e.Info);
    if (false == (await errLogFile.exists())) {
      await errLogFile.create(recursive: true);
    } else {
      final state = await errLogFile.stat();
      if (state.size >= MyLogger.fileSizeLimit) {
        // 大小超过限制
        final data = await errLogFile.readAsBytes();
        await errLogFile.writeAsBytes(
            data.sublist((state.size - (MyLogger.fileSizeLimit / 2)).toInt()));
      }
    }
    if (false == (await infoLogFile.exists())) {
      await infoLogFile.create(recursive: true);
    } else {
      final state = await infoLogFile.stat();
      if (state.size >= MyLogger.fileSizeLimit) {
        // 大小超过限制
        final data = await infoLogFile.readAsBytes();
        await infoLogFile.writeAsBytes(
            data.sublist((state.size - (MyLogger.fileSizeLimit / 2)).toInt()));
      }
    }
    final outErr = errLogFile.openWrite(mode: FileMode.append);
    final outInfo = infoLogFile.openWrite(mode: FileMode.append);
    Logger.root.onRecord.listen((item) {
      if (kDebugMode) {
        print(item.toString());
      }
      // 将日志转换字符串，添加后标记，写入文件
      final str = (MyLogRecord.getJsonStr(
            level: item.level,
            message: item.message,
            time: item.time,
            sequenceNumber: item.sequenceNumber,
            loggerName: item.loggerName,
            content: null,
          )) +
          MyLogger.tag;
      if (item.level >= Level.WARNING) {
        outErr.writeln(str);
      } else {
        outInfo.writeln(str);
      }
    });
    if (kReleaseMode) {
      // debug 模式直接输出
      FlutterError.onError = (kReleaseMode)
          ? (details) {
              MyLogger._instance.severe(MyLogItem(
                prefix: "Flutter Error",
                msg: [
                  details.library.toString(),
                  details.exception.toString(),
                  details.context.toString(),
                  details.stack.toString(),
                ],
              ));
            }
          : null;
      PlatformDispatcher.instance.onError = (kReleaseMode)
          ? (error, stack) {
              MyLogger._instance.severe(MyLogItem(
                prefix: "PlatformDispatcher Error",
                msg: [
                  error.toString(),
                  stack.toString(),
                ],
              ));
              return true;
            }
          : null;
    }
  }

  void shout(MyLogItem msg) {
    _log.shout(convert.jsonEncode(msg));
  }

  void severe(MyLogItem msg) {
    _log.severe(convert.jsonEncode(msg));
  }

  void warning(MyLogItem msg) {
    _log.warning(convert.jsonEncode(msg));
  }

  void info(MyLogItem msg) {
    _log.info(convert.jsonEncode(msg));
  }

  void config(MyLogItem msg) {
    _log.config(convert.jsonEncode(msg));
  }

  void fine(MyLogItem msg) {
    _log.fine(convert.jsonEncode(msg));
  }

  void finer(MyLogItem msg) {
    _log.finer(convert.jsonEncode(msg));
  }

  void finest(MyLogItem msg) {
    _log.finest(convert.jsonEncode(msg));
  }
}

class MyLogItem {
  final String? prefix;
  final List<String>? msg;

  MyLogItem({
    this.prefix,
    this.msg,
  });

  factory MyLogItem.fromJson(Map<String, dynamic> json) {
    final List? list = json["msg"];
    List<String>? msgs;
    if (null != list) {
      msgs = [];
      for (int i = 0, len = list.length; i < len; ++i) {
        msgs.add(list[i].toString());
      }
    }
    return MyLogItem(
      prefix: json["prefix"],
      msg: msgs,
    );
  }

  factory MyLogItem.fromJsonStr(String json) {
    try {
      return MyLogItem.fromJson(convert.jsonDecode(json));
    } catch (e) {
      // 由于是日志结构本身的错误，解析失败直接输出即可，
      // 仍写回日志可能导致滚雪球
      if (kDebugMode) {
        print("json解析错误");
        print(e.toString());
        print(json);
      }
      return MyLogItem(msg: [json]);
    }
  }

  Map<String, dynamic> toJson() {
    final remap = <String, dynamic>{
      "prefix": prefix ?? "",
      "msg": msg ?? [],
    };
    return remap;
  }

  @override
  String toString() {
    return toJson().toString();
  }
}

class MyLogRecord {
  final Level level;
  final String message;

  /// Logger where this record is stored.
  final String loggerName;

  /// Time when this record was created.
  final DateTime time;

  /// Unique sequence number greater than all log records created before it.
  final int sequenceNumber;

  final MyLogItem content;

  MyLogRecord({
    required this.level,
    required this.message,
    required this.time,
    required this.content,
    this.loggerName = "",
    this.sequenceNumber = -1,
  });

  static String getJsonStr({
    required Level level,
    required String? message,
    required DateTime time,
    required MyLogItem? content,
    String loggerName = "",
    int sequenceNumber = -1,
  }) {
    assert(null != message || null != content);
    final remap = {
      "levelValue": level.value,
      "levelName": level.name,
      "message": message,
      "loggerName": loggerName,
      "time": time.millisecondsSinceEpoch,
      "sequenceNumber": sequenceNumber,
      "content": message ?? convert.jsonEncode(content!),
    };
    return convert.jsonEncode(remap);
  }

  factory MyLogRecord.fromJson(Map<String, dynamic> json) {
    return MyLogRecord(
      level: Level(json["levelName"] ?? "", json["levelValue"] ?? -777),
      message: json["message"] ?? "",
      time: DateTime.fromMillisecondsSinceEpoch(json["time"] ?? 0),
      content: MyLogItem.fromJsonStr(json["content"] ?? ""),
      loggerName: json["loggerName"] ?? "",
      sequenceNumber: json["sequenceNumber"] ?? -1,
    );
  }

  factory MyLogRecord.fromJsonStr(String json) {
    try {
      return MyLogRecord.fromJson(convert.jsonDecode(json));
    } catch (e) {
      // 由于是日志结构本身的错误，解析失败直接输出即可，
      // 仍写回日志可能导致滚雪球
      if (kDebugMode) {
        print("json解析错误");
        print(e.toString());
        print(json);
      }
      return MyLogRecord(
        level: const Level("", -777),
        message: json,
        time: DateTime.fromMillisecondsSinceEpoch(0),
        content: MyLogItem(),
      );
    }
  }

  Map<String, dynamic> toJson() {
    final remap = <String, dynamic>{
      "levelValue": level.value,
      "levelName": level.name,
      "message": message,
      "loggerName": loggerName,
      "time": time.millisecondsSinceEpoch,
      "sequenceNumber": sequenceNumber,
      "content": convert.jsonEncode(content),
    };
    return remap;
  }

  @override
  String toString() {
    return toJson().toString();
  }
}
