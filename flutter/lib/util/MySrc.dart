// ignore_for_file: file_names, camel_case_types, constant_identifier_names, non_constant_identifier_names
import 'dart:convert' as convert;

import '/util/MyLogger.dart';

enum MySrcType_e {
  Bili,
  UrlLink,
  Webdav,
  MyLink,
  MyId,
  MyCos,
  Local,
  LocalCache,
  LocalCacheId,
  Asset,
  Undefined,
}

class MySrcTypeStr_e {
  static const String BiliStr = "bili",
      UrlLinkStr = "link",
      WebdavStr = "webdav",
      AssetStr = "assest",
      LocalStr = "local",
      LocalCacheStr = "localCache",
      LocalCacheIdStr = "LocalCacheId",
      MyId = "myid",
      MyLink = "mylink",
      MyCos = "mycos",
      UndefinedStr = "";
  static const typeStrMap = <String, MySrcType_e>{
    UndefinedStr: MySrcType_e.Undefined,
    BiliStr: MySrcType_e.Bili,
    UrlLinkStr: MySrcType_e.UrlLink,
    LocalStr: MySrcType_e.Local,
    LocalCacheStr: MySrcType_e.LocalCache,
    LocalCacheIdStr: MySrcType_e.LocalCacheId,
    AssetStr: MySrcType_e.Asset,
    MyId: MySrcType_e.MyId,
    MyLink: MySrcType_e.MyLink,
    WebdavStr: MySrcType_e.Webdav,
    MyCos: MySrcType_e.MyCos,
  };
  static String toTypeStr(MySrcType_e type) {
    switch (type) {
      case MySrcType_e.Undefined:
        return UndefinedStr;
      case MySrcType_e.Bili:
        return BiliStr;
      case MySrcType_e.UrlLink:
        return UrlLinkStr;
      case MySrcType_e.Webdav:
        return WebdavStr;
      case MySrcType_e.Local:
        return LocalStr;
      case MySrcType_e.LocalCache:
        return LocalCacheStr;
      case MySrcType_e.LocalCacheId:
        return LocalCacheIdStr;
      case MySrcType_e.Asset:
        return AssetStr;
      case MySrcType_e.MyLink:
        return MyLink;
      case MySrcType_e.MyId:
        return MyId;
      case MySrcType_e.MyCos:
        return MyCos;
    }
  }

  static MySrcType_e? toType(String? in_type) {
    return typeStrMap[in_type];
  }

  // 当in_type不合规时，使用undefined返回
  static MySrcType_e mustToType(String? in_type) {
    return typeStrMap[in_type] ?? MySrcType_e.Undefined;
  }
}

class MySrcInfo_c {
  // 资源类型
  MySrcType_e _type;

  MySrcType_e get type => _type;
  // 获取type的字符串格式
  String get typeStr => MySrcTypeStr_e.toTypeStr(type);

  MySrcInfo_c({
    MySrcType_e type = MySrcType_e.Undefined,
  }) : _type = type;

  factory MySrcInfo_c.fromJson(Map<String, dynamic> json) {
    final reObj = MySrcInfo_c();
    final rebool = reObj.oFromJson(json);
    if (true == rebool) {
      return reObj;
    } else {
      return MySrcInfo_c();
    }
  }

  factory MySrcInfo_c.fromJsonStr(String json) {
    final reObj = MySrcInfo_c();
    final rebool = reObj.oFromJsonStr(json);
    if (true == rebool) {
      return reObj;
    } else {
      return MySrcInfo_c();
    }
  }

  void setType(MySrcType_e in_type) {
    _type = in_type;
  }

  bool oFromJson(Map<String, dynamic> json) {
    final retype = MySrcTypeStr_e.toType(json['type']);
    if (null != retype) {
      _type = retype;
      return true;
    } else {
      return false;
    }
  }

  bool oFromJsonStr(String json) {
    try {
      return oFromJson(convert.jsonDecode(json));
    } catch (e) {
      MyLogger.to().severe(MyLogItem(
        prefix: "Json解析错误",
        msg: [e.toString(), json],
      ));
      return false;
    }
  }

  /// * 建议继承类也在Undefined时直接return {};
  /// 由于type后续还会增加，当新type在当前版本不存在时，会赋值Undefined，并放弃解析，
  /// 将所有内容归为src，这样可以确保一定的兼容性。
  Map<String, dynamic> toJson() {
    if (MySrcType_e.Undefined == type) {
      return {};
    } else {
      return {
        'type': typeStr,
      };
    }
  }

  MySrcInfo_c copyWith({
    MySrcType_e? type,
  }) {
    return MySrcInfo_c(
      type: type ?? this.type,
    );
  }

  @override
  int get hashCode => typeStr.hashCode;

  @override
  bool operator ==(Object other) {
    return (hashCode == other.hashCode);
  }
}

/// 通用资源表示类
/// * info.[type] == Webdav类型的资源，将会把另一个 (MySrc_c<WebdavSrcInfo_c>).toString()作为其 src
///   * 即可能的结构如下：
///     MySrc_c<MySrcInfo_c>{
///       info: {
///          type: MySrcType_e.Webdav
///       },
///       src: "{'type':'myId', 'path': '资源路径'}1000000"
///     }
///   * 其中，$.src 内的type也可能是可以包含其他类型的webdav连接。
class MySrc_c<T extends MySrcInfo_c> {
  /// 截取string中的json信息部分
  static final reg = RegExp(r'^(\{.+?\})');

  /// 主体变量 -------------
  /// 资源路径
  String _src;

  /// 资源信息
  T _info;

  /// 辅助变量 --------------

  /// 用于辅助toString缓存判断的哈希值
  int _toStringHashCode = -1;

  /// toString 方法的缓存
  String? _toStringCache;

  /// get ---------------
  String get src => _src;
  T get info => _info;

  MySrc_c({
    String src = "",
    required T info,
  })  : _src = src,
        _info = info;

  void setSrc(String in_src) {
    _src = in_src;
  }

  void setInfo(T in_info) {
    _info = in_info;
  }

  factory MySrc_c.fromString(String in_str, T info) {
    final src = MySrc_c<T>(
      info: info,
    );
    src.oFromString(in_str);
    return src;
  }

  static MySrc_c<T1>? fromStringOrNull<T1 extends MySrcInfo_c>(
    String? in_str,
    T1 info,
  ) {
    if (null == in_str) {
      return null;
    }
    return MySrc_c.fromString(in_str, info);
  }

  void oFromString(String in_str) {
    if (in_str.isNotEmpty) {
      // in_str非空
      // 截取json信息
      final result = reg.firstMatch(in_str);
      if (null != result) {
        final jsonInfoStr = result[1];
        if (null != jsonInfoStr) {
          final rebool = _info.oFromJsonStr(jsonInfoStr);
          if (true == rebool) {
            // 解析json信息成功，则把后面部分作为src
            setSrc(in_str.substring(jsonInfoStr.length));
            return;
            // 否则整个str都是src
          }
        }
      }
    }
    setSrc(in_str);
  }

  /// 检查资源是否为空
  bool isSrcEmpty() {
    return (src.isEmpty);
  }

  MySrc_c copyWith({
    String? src,
    T? info,
  }) {
    return MySrc_c(
      src: src ?? this.src,
      info: info ?? this.info.copyWith(),
    );
  }

  @override
  String toString() {
    // 信息非空，则需要转换
    int code = hashCode;
    if (null != _toStringCache) {
      // 如果存在缓存
      if (code == _toStringHashCode) {
        // 哈希值没有变，缓存可用
        return _toStringCache!;
      }
    }
    // {info}src
    final remap = info.toJson();
    if (remap.isEmpty) {
      return src;
    }
    _toStringCache = convert.jsonEncode(remap) + src;
    _toStringHashCode = code;
    return _toStringCache!;
  }

  @override
  int get hashCode => (_info.hashCode + _src.hashCode);

  @override
  bool operator ==(Object other) {
    return (hashCode == other.hashCode);
  }
}
